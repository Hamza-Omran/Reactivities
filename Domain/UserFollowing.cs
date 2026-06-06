using System;

namespace Domain;

public class UserFollowing
{
    public required string ObserverId { get; set; } // follower
    public User Observer { get; set; } = null!;
    public required string TargetId { get; set; } // followee
    public User Target { get; set; } = null!;
}
