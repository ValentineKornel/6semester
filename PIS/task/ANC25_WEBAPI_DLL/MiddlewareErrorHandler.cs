using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Hosting.Server;
using Microsoft.AspNetCore.Hosting.Server.Features;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using static System.Net.Mime.MediaTypeNames;

namespace ANC25_WEBAPI_DLL
{
    // https://learn.microsoft.com/en-us/aspnet/core/fundamentals/error-handling?view=aspnetcore-9.0

    public class ANC25Exception:Exception
    {  
        public string Code     {get; } = string.Empty;  
        public string Details {get; } = string.Empty;
        public int?   Status { get; } = null;
        public ANC25Exception(string code, string detail, string? message = null, int? status = null) :base(message)
        {
            this.Details = detail;
            this.Code = code; 
            this.Status = status??500;
        } 
    }


    public static class MiddlewareExtensions 
    {
      public static IApplicationBuilder UseANCErrorHandler(this  IApplicationBuilder app, string prefix)
      {
         return app.UseMiddleware<MiddlewareErrorHandler>(prefix);   
      }
        public static IApplicationBuilder UseCelerbritiesErrorHandler(this IApplicationBuilder app, string prefix)
        {
            return app.UseMiddleware<MiddlewareErrorHandler>(prefix);
        }


    }
     
    public class MiddlewareErrorHandler
    {
        private readonly  RequestDelegate _next;
        private readonly  string          _prefix;
        //private readonly int?             _status;
        private readonly IWebHostEnvironment _env;   
        public MiddlewareErrorHandler(IWebHostEnvironment env,   RequestDelegate next, string prefix = "Middleware") 
        {
          this._next = next;
          this._prefix = prefix;  
          this._env = env;
        }
        public async Task InvokeAsync(HttpContext context)
        {
            try { await this._next(context); }
            catch (ANC25Exception ex) 
            {
                IResult rc = Results.Problem(statusCode: ex.Status, detail:$"{ex.Code}:{ex.Details}", instance:$"{_prefix}" );
                await rc.ExecuteAsync(context);
            }
            catch (BadHttpRequestException ex)
            {
                string detail = $"{ex.Message} --> {ex.InnerException?.Message}";
                if (this._env.IsDevelopment()) detail = $"{ex.Message} --> {ex.InnerException?.Message} + {ex.InnerException?.StackTrace}";
                IResult rc = Results.Problem(statusCode: ex.StatusCode, detail: detail);
                await rc.ExecuteAsync(context);

            }
            catch (Exception ex)
            {

                string detail = $"{ex.Message} --> {ex.InnerException?.Message}";
                if (this._env.IsDevelopment()) detail = $"{ex.Message} --> {ex.InnerException?.Message} + {ex.InnerException?.StackTrace}";
                IResult rc = Results.Problem(statusCode: 500, detail: detail);
                await rc.ExecuteAsync(context);
            }
        }
      }

}
