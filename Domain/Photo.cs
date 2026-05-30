using System;
using System.Text.Json.Serialization;

namespace Domain;

public class Photo
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Url { get; set; }
    public required string PublicId { get; set; }

    // we add these navigation properties for the user entity so entity framework by convention will create the relationship
    // in such a way that if we were to delete a user, then it would also provide the cascade delete so that the photo will be
    // deleted as well
    // nav properties
    public required string UserId { get; set; }

    // this gives json serializer cycles so we actually don't need it so we gonna ingnore it
    [JsonIgnore]
    public User User { get; set; } = null!;
}
