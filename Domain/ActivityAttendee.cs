using System;

namespace Domain;

public class ActivityAttendee
{
    // we made it optional as we are in the entity framework
    // and that is how microsoft does handling it
    public string? UserId { get; set; } 
    public User User { get; set; } = null!; // the ! is to override the non-nullable

    public string? ActivityId { get; set; }
    public Activity Activity { get; set; } = null!;

    public bool IsHost { get; set; }
    public DateTime DateJoined { get; set; } = DateTime.UtcNow;
}
