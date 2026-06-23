using API.Middleware;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using Domain;
using FluentValidation;
using Infrastructure.Security;
using Infrastructure.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.EntityFrameworkCore;
using Persistence;
using Infrastructure.Photos;
using Application.Interfaces;
using API.SignalR;
using Resend;
using Infrastructure.Email;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

// here we can define the policy for our endpoints
builder.Services.AddControllers(opt =>
{
    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    opt.Filters.Add(new AuthorizeFilter(policy));
});
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"), sqlOptions =>
    {
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    });
});

// now we gonna add the websites that can actually access our APIs
// and as this adds header to our https response we need to add a middleware for it
// the order doesn't matter in services
builder.Services.AddCors();
builder.Services.AddSignalR();
builder.Services.AddMediatR(x => {
    x.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
    // as we don't know the type we specify <,> 
    x.AddOpenBehavior(typeof(ValidationBehaviour<,>));
}); // as we choose this (RegisterServicesFromAssemblyContaining) here we can add one handler and the others will be automatically registered

builder.Services.AddHttpClient<ResendClient>(); // we don't need to configure that but inorder to send that we need to send that email by http to resend
builder.Services.Configure<ResendClientOptions>(opt =>
{
    opt.ApiToken = builder.Configuration["Resend:ApiToken"]!; // we will add the ! since we already know that it is there
});
builder.Services.AddTransient<IResend, ResendClient>();
builder.Services.AddTransient<IEmailSender<User>, EmailSender>();

// this is scoped to the http request itself
builder.Services.AddScoped<IUserAccessor, UserAccessor>();
builder.Services.AddScoped<IPhotoService, PhotoService>();
// we used this way of overload as the package is updated than neil cummings!    
builder.Services.AddAutoMapper(cfg => {}, typeof(MappingProfiles).Assembly); // the automapper needs to know where is the assembly is to register the mapping profiles with our application => the assembly is the .dll file
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
builder.Services.AddTransient<ExceptionMiddleware>(); // transient means this service is going to be instantiated when needed and disposed as soon as the exception has been completed effectively and is no longer needed
builder.Services.AddIdentityApiEndpoints<User>(opt =>
{
    opt.User.RequireUniqueEmail = true;
    // opt.SignIn.RequireConfirmedEmail = true; as resend will work for ur registered email as long as u don't have a customized email
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();
builder.Services.AddAuthorization(opt =>
{
    opt.AddPolicy("IsActivityHost", policy =>
    {
        policy.Requirements.Add(new IsHostRequirement());
    });
});
builder.Services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();
builder.Services.Configure<CloudinarySettings>(builder.Configuration.GetSection("CloudinarySettings"));

var app = builder.Build();

// when we add a middleware it is important to take care about the order since it is fussy about the ordering

// when it comes to the exception middleware it comes on the top of middleware pipeline
app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.

app.UseCors(options => options.AllowAnyHeader().AllowAnyMethod()
    .AllowCredentials() // so it accepts cookies from our browser which is a different origin from the API
    .WithOrigins("http://localhost:3000", "https://localhost:3000", "http://localhost:5001", "https://localhost:5001")); // Added Kestrel ports for static file serving

// the authentication must be before the authorization else u will get 401 that u are unauthorized
app.UseAuthentication();
app.UseAuthorization();

app.UseDefaultFiles(); // it will search for and serve index.html in the wwwroot folder
app.UseStaticFiles(); // it will serve the js and css files

app.MapControllers();
app.MapGroup("api").MapIdentityApi<User>(); // so the login will be /api/login
app.MapHub<CommentHub>("/comments");
app.MapFallbackToController("Index", "Fallback"); // we don't need to add use controller since it has the controller convention in its name

// we can't use the services we initialized here so we gonna use something called service locator pattern
// and we gonna use the using keyword so anything we are going to create in this scope is going to be disposed by the framework (cleaned)
//now we are creating a service scope and using
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var userManager = services.GetRequiredService<UserManager<User>>();
    var context = services.GetRequiredService<AppDbContext>();
    //Asynchronously applies any pending migrations for the context to the database. 
    // Will create the database if it does not already exist.
    // so it gonna create the db for us once the app.Run() starts
    await context.Database.MigrateAsync();

    // and after this we gonna seed our data
    await DbInitializer.SeedData(context, userManager);
}
catch (Exception ex)
{
    var logger = services.GetRequiredService<ILogger<Program>>();
    logger.LogError($"an error occurred during migration, {ex}");
}

app.Run();
