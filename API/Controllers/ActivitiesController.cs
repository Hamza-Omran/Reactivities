using System;
using Domain;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace API.Controllers;

// it has a route of API in square brackets controller, and it is also deriving from the base controller
public class ActivitiesController(AppDbContext context) : BaseApiController
{

    // ctor and tap to create a constructor
    // the old way of doing dependency injection is to make a class and make it takes as a parameter the class we wish to inject and assign it to a variable 
    // but now we use the primary constructor and we use it when we have a single constructor rather than using the boilerplate

    [HttpGet]
    // we use action result when we want to return an http respond
    public async Task<ActionResult<List<Activity>>> GetActivities()
    {
        // 503 is too busy and will be sent when the server is too busy 
        // so with the async when a request comes it gonna pass it to another separate thread request delegate 
        // so in the mean time that the request come on can handle another request
        // so using async is for scalability feature
        return await context.Activities.ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Activity>> GetActivityDetail(string id)
    {
        // if not found then this could be null so its type is var
        var activity = await context.Activities.FindAsync(id);

        // this notfound will return 404 respond and we have it because we are using actionresult
        if(activity == null) return NotFound();

        return activity;
    }
}
