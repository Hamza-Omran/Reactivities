using Microsoft.EntityFrameworkCore;
using Persistence;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(opt =>
{
    opt.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection"));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
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
