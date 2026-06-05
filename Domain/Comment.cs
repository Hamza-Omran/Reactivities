using System;

namespace Domain;

public class Comment
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Body { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // navigation properties
    // ok now when we gonna return the json serializer won't be able to serialize the user nor the activity 
    // and json ignore won't work too since we do want some properties from the user to show so
    // we are going to create our Dto and map it using mapper
    public required string UserId { get; set; }
    public User User { get; set; } = null!;

    public required string ActivityId { get; set; }
    public Activity Activity { get; set; } = null!;
}
