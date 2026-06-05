using System;
using Domain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace Persistence;

public class AppDbContext(DbContextOptions options) : IdentityDbContext<User>(options)
{
    public required DbSet<Activity> Activities { get; set; }
    public required DbSet<ActivityAttendee> ActivityAttendees { get; set; }
    public required DbSet<Photo> Photos { get; set; }
    public required DbSet<Comment> Comments { get; set; }

    // this is where to define the configuration
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<ActivityAttendee>(x => x.HasKey(a => new {a.ActivityId, a.UserId}));

        builder.Entity<ActivityAttendee>()
            .HasOne(x=>x.User)
            .WithMany(x=>x.Activities)
            .HasForeignKey(x=>x.UserId);

        builder.Entity<ActivityAttendee>()
            .HasOne(x=>x.Activity)
            .WithMany(x=>x.Attendees)
            .HasForeignKey(x=>x.ActivityId);

        // now this function shows different time since it is supposed to get utc time but our sqlite doesn't support that
        // so the additional info for the time zone that should be stored with the date is not in sqlite
        // so we convert the time we get from db before we send it to the client
        var dateTimeConverter = new ValueConverter<DateTime, DateTime>(
            v => v.ToUniversalTime(),
            v => DateTime.SpecifyKind(v, DateTimeKind.Utc)
        );

        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                if(property.ClrType == typeof(DateTime))
                {
                    property.SetValueConverter(dateTimeConverter);
                }
            }
        }
    }
}
