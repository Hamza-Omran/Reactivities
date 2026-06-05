using System;
using Application.Activities.Commands;
using Application.Activities.Queries;
using MediatR;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

// hub is going to work as our websocket controller it is as equivalent to one of our api controllers
// this is the endpoint the clients are going to connect to and maintain a connection to the hub
public class CommentHub(IMediator mediator) : Hub
{

    // we will create a method so the client when connected to the hub can also create a comment
    public async Task SendComment(AddComment.Command command)
    {
        var comment = await mediator.Send(command);

        await Clients.Group(command.ActivityId).SendAsync("ReceiveComment", comment.Value);
    }

    // just by typing override many methods gonna show that we can implement
    public override async Task OnConnectedAsync()
    {
        //  we need to get hold of http context(to get the activityId) so we can get the initial connection and then our websocket will maintain it
        var httpContext = Context.GetHttpContext(); // this will allow us to interrogate the query params and get hold of the activityId
        var activityId = httpContext?.Request.Query["activityId"];

        if(string.IsNullOrEmpty(activityId)) throw new HubException("No activity with this id");

        await Groups.AddToGroupAsync(Context.ConnectionId, activityId!);

        var result = await mediator.Send(new GetComments.Query{ActivityId = activityId!});

        // the caller is our current user, and the name of the method LoadComments must be matched in the client
        await Clients.Caller.SendAsync("LoadComments", result.Value);


    }
}
