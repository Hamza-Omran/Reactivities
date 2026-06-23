using System;
using Domain;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Resend;

namespace Infrastructure.Email;

// we get this interface from asp net identity
//  we will need access to our resend so we injected it
//  now we do have the scopeFactory so the error of cannot resolve because it requries a scoped factory is solved so the transient in program.cs can work
public class EmailSender(IServiceScopeFactory scopeFactory) : IEmailSender<User>
{
    //  for the confirmation link it will be created in the signup and for the default message we will override it here
    public async Task SendConfirmationLinkAsync(User user, string email, string confirmationLink)
    {

        var subject = "Confirm Your Email Address";
        //  to write html
        var body = $@"
            <p>Hi {user.DisplayName}</p>
            <p>Please confirm your email by clicking the link below</p>
            <p><a href='{confirmationLink}'>Click here to verify email</a></p>
            <p>Thanks</p>
        ";

        await SendEmailAsync(email, subject, body);
    }


    public Task SendPasswordResetCodeAsync(User user, string email, string resetCode)
    {
        throw new NotImplementedException();
    }

    public Task SendPasswordResetLinkAsync(User user, string email, string resetLink)
    {
        throw new NotImplementedException();
    }

    private async Task SendEmailAsync(string email, string subject, string body)
    {
        using var scope  = scopeFactory.CreateScope();
        var resend = scope.ServiceProvider.GetRequiredService<IResend>();

        var message = new EmailMessage
        {
            // now as we don't have a custom email we will need to use resend domain
            From = "whatever@resend.dev",
            Subject = subject,
            HtmlBody = body,
        };

        message.To.Add(email);

        // because of the restrictions on where resend will send the email we will fish it out from our console logs
        // until we are actually ready to use a proper email address
        Console.WriteLine(message.HtmlBody);
        await resend.EmailSendAsync(message);
        // await Task.CompletedTask; // we will use this instead of the send message since we can see the log and use the link in postman rather than it going to be sent
    }
}
