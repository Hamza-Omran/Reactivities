using Application.Core;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BaseApiController : ControllerBase
    {
        private IMediator? _mediator;

        // the ??= is to make sure if it is null then assign, and the ?? is just to check
        protected IMediator Mediator => 
            _mediator??= HttpContext.RequestServices.GetService<IMediator>()
                ?? throw new InvalidOperationException("IMediator is unavailable");

        protected ActionResult HandleResults<T>(Result<T> result)
        {
            if(!result.IsSuccess && result.Code == 404) return NotFound();

            if(result.IsSuccess && result.Value != null) return Ok(result.Value); // now we return Ok rather than making ActionResult have the type T since we gonna use Unit value which is not gonna work

            return BadRequest(result.Error);
        }
    }
}
