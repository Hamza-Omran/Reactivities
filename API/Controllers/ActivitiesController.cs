using System;
using Application.Activities.Commands;
using Application.Activities.DTOs;
using Application.Activities.Queries;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

// it has a route of API in square brackets controller, and it is also deriving from the base controller
// to use mediator we use the IMediatory interface 

// basically we made our API as dumb as possible

// we are going to make our Mediatory being inherited from the baseApicontroller => 
// so other controllers have the access to the same mediator
public class ActivitiesController : BaseApiController
{

    // ctor and tap to create a constructor
    // the old way of doing dependency injection is to make a class and make it takes as a parameter the class we wish to inject and assign it to a variable 
    // but now we use the primary constructor and we use it when we have a single constructor rather than using the boilerplate

    // [AllowAnonymous] // this is to make this endpoint accessed by anyone when the programs make them all authorized
    [HttpGet]
    // we use action result when we want to return an http respond
    public async Task<ActionResult<List<ActivityDto>>> GetActivities( // CancellationToken ct
        )
    {
        // 503 is too busy and will be sent when the server is too busy 
        // so with the async when a request comes it gonna pass it to another separate thread request delegate 
        // so in the mean time that the request come on can handle another request
        // so using async is for scalability feature

        // thin controller endpoint means it doesn't have any logic and they don't know about what is going 
        // on in the application layer it doesn't know about the ORM we are using and the db logic

        // now we gonna need to add mediator as another service in the program.cs file, as we are injecting it in our activities conroller
        return await Mediator.Send(new GetActivityList.Query()//, ct
        );
    }

    // if we weren't using the clean pattern architecture, then the typical thing we would do is to handle the exceptions in 
    // our controllers, but that is not good as we consider this to be the job of application layer
    // so what would be good to do is to return an object result
    // [Authorize] this is to make the endpoint authorized
    [HttpGet("{id}")]
    public async Task<ActionResult<ActivityDto>> GetActivityDetail(string id)
    {
        // // if not found then this could be null so its type is var
        // var activity = await context.Activities.FindAsync(id);

        // // this notfound will return 404 respond and we have it because we are using actionresult
        // if(activity == null) return NotFound();

        // return activity;

        return HandleResults(await Mediator.Send(new GetActivityDetails.Query{Id = id}));        
    }

    [HttpPost]
    public async Task<ActionResult<string>> CreateActivity(CreateActivityDto activityDto)
    {
        return HandleResults(await Mediator.Send(new CreateActivity.Command{ActivityDto = activityDto}));
    }
    
    [HttpPut("{id}")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> EditActivity(string id, EditActivityDto activity)
    {
        activity.Id = id;
        return HandleResults(await Mediator.Send(new EditActivity.Command{ActivityDto = activity}));
        // // we use it to return nothing
        // return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Policy = "IsActivityHost")]
    public async Task<ActionResult> DeleteActivity(string id)
    {
        return HandleResults(await Mediator.Send(new DeleteActivity.Command{Id = id}));
    }

    [HttpPost("{id}/attend")]
    public async Task<ActionResult> Attend(string id)
    {
        return HandleResults(await Mediator.Send(new UpdateAttendance.Command{Id = id}));
    }
}
