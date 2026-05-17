using System;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Infrastructure.Security;

public class IsHostRequirement : IAuthorizationRequirement
{
}

public class IsHostRequirementHandler(AppDbContext dbContext, IHttpContextAccessor httpContextAccessor) : AuthorizationHandler<IsHostRequirement>
{
    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, IsHostRequirement requirement)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if(userId == null) return;

        //  so we can access the route values of the link
        var httpContext = httpContextAccessor.HttpContext;

        //  this does the following if the getRouteValue is string  then it assigns it in activityId else it gonna return
        if(httpContext?.GetRouteValue("id") is not string activityId) return;

        var attendee = await dbContext.ActivityAttendees
            //.AsNoTracking() // now we use this so the attendees list won't be overriden by an empty list as in .net 9
            //  and before it add the attendee which we are trying to get tot he activity and it is empty so it is overriden
            .SingleOrDefaultAsync(x => x.UserId == userId && x.ActivityId == activityId);

        if(attendee == null) return;

        if(attendee.IsHost) context.Succeed(requirement);
    }
}