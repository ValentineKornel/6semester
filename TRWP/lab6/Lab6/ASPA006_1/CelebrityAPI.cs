using ASPA006_1;
using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;

internal class Program
{
    private static void Main(string[] args)
    {

        var builder = WebApplication.CreateBuilder(args);

        builder.Configuration.AddJsonFile("Celebrities.config.json");
        builder.Services.Configure<CelebritiesConfig>(builder.Configuration.GetSection("Celebrities"));

        builder.Services.AddScoped<IRepostory, Repository>((IServiceProvider p) =>
        {
            CelebritiesConfig config = p.GetService<IOptions<CelebritiesConfig>>().Value;
            return new Repository(config.ConnectionString);
        });

        var app = builder.Build();
        var config = app.Services.GetService<IOptions<CelebritiesConfig>>().Value;

        
        app.UseExceptionHandler("/Error");
        app.UseDefaultFiles();
        app.UseStaticFiles();
        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(config.PhotosFolder),
            RequestPath = config.PhotosRequestPath
        });
        

        var celebrities = app.MapGroup("/api/Celebrities");
        
        celebrities.MapGet("/", (IRepostory repo) => repo.GetAllCelebrities());

        celebrities.MapGet("/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetCelebrityById(id));

        celebrities.MapGet("/Lifeevents/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetCelebrityByLifeeventId(id));

        celebrities.MapDelete("/{id:int:min(1)}", (IRepostory repo, int id) => repo.DeleteCelebrity(id));

        celebrities.MapPost("/", (IRepostory repo, Celebrity celebrity) => repo.AddCelebrity(celebrity));

        celebrities.MapPut("/{id:int:min(1)}", (IRepostory repo, int id, Celebrity celebrity) => repo.UpdateCelebrity(id, celebrity));

        celebrities.MapGet("/photo/{fname}", async (IOptions<CelebritiesConfig> iconfig, HttpContext context, string fname) =>
        {
            var config = iconfig.Value;
            var photoPath = Path.Combine(config.PhotosFolder, fname);

            if (!File.Exists(photoPath))
                return Results.NotFound();

            var mimeType = "image/jpeg";
            return Results.File(photoPath, mimeType);

        });


        var lifeevents = app.MapGroup("/api/Lifeevents");

        lifeevents.MapGet("/", (IRepostory repo) => repo.GetAllLifeevents());

        lifeevents.MapGet("/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetLifeeventById(id));

        lifeevents.MapGet("/Celebrities/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetLifeeventsByCelebrityId(id));

        lifeevents.MapDelete("/{id:int:min(1)}", (IRepostory repo, int id) => repo.DeleteLifeevent(id));

        lifeevents.MapPost("/", (IRepostory repo, Lifeevent lifeevent) => repo.AddLifeevent(lifeevent));

        lifeevents.MapPut("/{id:int:min(1)}", (IRepostory repo, int id, Lifeevent lifeevent) => repo.UpdateLifeevent(id, lifeevent));

        app.Map("/Error", (HttpContext ctx) =>
        {
            Exception? ex = ctx.Features.Get<IExceptionHandlerFeature>()?.Error;
            IResult rc = Results.Problem(detail: ex.Message, instance: app.Environment.EnvironmentName, title: "ASPA004", statusCode: 500);

            if (ex != null)
            {
                if (ex is FileNotFoundException) rc = Results.Problem(title: "ASPA004", detail: ex.Message, instance: app.Environment.EnvironmentName, statusCode: 500);
                if (ex is BadHttpRequestException) rc = Results.BadRequest(ex.Message);
            }
            return rc;
        });

        app.MapFallbackToFile("index.html");

        app.Run();
    }

    
}