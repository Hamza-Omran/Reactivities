using API.Middleware;
using Application.Activities.Queries;
using Application.Activities.Validators;
using Application.Core;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

// now we gonna add the websites that can actually access our APIs
// and as this adds header to our https response we need to add a middleware for it
// the order doesn't matter in services
builder.Services.AddCors();
builder.Services.AddMediatR(x => {
    x.RegisterServicesFromAssemblyContaining<GetActivityList.Handler>();
    // as we don't know the type we specify <,> 
    x.AddOpenBehavior(typeof(ValidationBehaviour<,>));
}); // as we choose this (RegisterServicesFromAssemblyContaining) here we can add one handler and the others will be automatically registered
// we used this way of overload as the package is updated than neil cummings!    
builder.Services.AddAutoMapper(cfg => {}, typeof(MappingProfiles).Assembly); // the automapper needs to know where is the assembly is to register the mapping profiles with our application => the assembly is the .dll file
builder.Services.AddValidatorsFromAssemblyContaining<CreateActivityValidator>();
builder.Services.AddTransient<ExceptionMiddleware>(); // transient means this service is going to be instantiated when needed and disposed as soon as the exception has been completed effectively and is no longer needed

var app = builder.Build();

// when we add a middleware it is important to take care about the order since it is fussy about the ordering

// when it comes to the exception middleware it comes on the top of middleware pipeline
app.UseMiddleware<ExceptionMiddleware>();

// Configure the HTTP request pipeline.

app.UseCors(options => options.AllowAnyHeader().AllowAnyMethod()
    .WithOrigins("http://localhost:3000", "https://localhost:3000")); // note adding the slash here will make it still saying cors problem

app.MapControllers();

// we can't use the services we initialized here so we gonna use something called service locator pattern
// and we gonna use the using keyword so anything we are going to create in this scope is going to be disposed by the framework (cleaned)
//now we are creating a service scope and using
using var scope = app.Services.CreateScope();
var services = scope.ServiceProvider;

try
{
    var context = services.GetService<AppDbContext>();
    //Asynchronously applies any pending migrations for the context to the database. 
    // Will create the database if it does not already exist.
    // so it gonna create the db for us once the app.Run() starts
    await context.Database.MigrateAsync();

    // and after this we gonna seed our data
    await DbInitializer.SeedData(context);
}
catch (Exception ex)
{
    var logger = services.GetService<ILogger<Program>>();
    logger.LogError("an error occurred during migration.");
}

app.Run();
