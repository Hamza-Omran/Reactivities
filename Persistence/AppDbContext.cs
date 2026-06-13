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
    public required DbSet<UserFollowing> UserFollowings { get; set; }

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
        
        builder.Entity<UserFollowing>(x =>
        {
            x.HasKey(k => new {k.ObserverId, k.TargetId});

            x.HasOne(o => o.Observer)
                .WithMany(x=>x.Followings)
                .HasForeignKey(x=>x.ObserverId)
                .OnDelete(DeleteBehavior.Cascade);

            x.HasOne(o => o.Target)
                .WithMany(x=>x.Followers)
                .HasForeignKey(x=>x.TargetId)
                .OnDelete(DeleteBehavior.NoAction); // we did no action because of hte sql server migration
        });

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
