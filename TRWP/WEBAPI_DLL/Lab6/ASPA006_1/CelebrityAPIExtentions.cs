using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace ASPA006_1
{
    public static class CelebrityAPIExtentions
    {
        public class CelebrityTitles
        {
            public string Head { get; } = "Celebrities Dictionary Internet Service";
            public string Title { get; } = "Celebrities";
            public string Copyright { get; } = @"Copyright BSTU";
        }

        public class CountryCodes : List<CountryCodes.ISOCountryCOdes>
        {
            public record ISOCountryCOdes(string code, string countryLabel);

            public CountryCodes(string jsoncountrycodespath) : base()
            {
                if (File.Exists(jsoncountrycodespath))
                {
                    FileStream fs = new FileStream(jsoncountrycodespath, FileMode.OpenOrCreate, FileAccess.Read);
                    List<ISOCountryCOdes>? cc = JsonSerializer.DeserializeAsync<List<ISOCountryCOdes>?>(fs).Result;
                    if (cc != null) this.AddRange(cc);
                }
            }
        }

        public static IServiceCollection AddCelebritiesConfiguration(this WebApplicationBuilder builder,
                                                                        string celebrityJson = "Celebrities.config.json")
        {
            builder.Configuration.AddJsonFile(celebrityJson);
            return builder.Services.Configure<CelebritiesConfig>(builder.Configuration.GetSection("Celebrities"));
        }

        public static IServiceCollection AddSelebritiesServices(this WebApplicationBuilder builder)
        {
            builder.Services.AddScoped<IRepostory, Repository>((IServiceProvider p) =>
            {
                CelebritiesConfig config = p.GetService<IOptions<CelebritiesConfig>>().Value;
                //Init.Execute(delete: true, create: true);
                return new Repository(config.ConnectionString);

            });

            builder.Services.AddSingleton<CelebrityTitles>();

            builder.Services.AddSingleton<CountryCodes>((p) => new CountryCodes(
                        p.GetRequiredService<IOptions<CelebritiesConfig>>().Value.ISO3166alpha2Path));

            return builder.Services;
        }

        public static RouteHandlerBuilder MapCelebrities(this IEndpointRouteBuilder routebuilder, string prefix = "/api/Celebrities")
        {
            var celebrities = routebuilder.MapGroup(prefix);

            //celebrities.MapGet("/", (IRepostory repo) => { throw new Exception(); repo.GetAllCelebrities(); });

            celebrities.MapGet("/", (IRepostory repo) => repo.GetAllCelebrities());

            celebrities.MapGet("/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetCelebrityById(id));

            celebrities.MapGet("/Lifeevents/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetCelebrityByLifeeventId(id));

            celebrities.MapDelete("/{id:int:min(1)}", (IRepostory repo, int id) => repo.DeleteCelebrity(id));

            celebrities.MapPost("/", (IRepostory repo, Celebrity celebrity) => repo.AddCelebrity(celebrity));

            celebrities.MapPut("/{id:int:min(1)}", (IRepostory repo, int id, Celebrity celebrity) => repo.UpdateCelebrity(id, celebrity));

            return celebrities.MapGet("/photo/{fname}", async (IOptions<CelebritiesConfig> iconfig, HttpContext context, string fname) =>
            {
                var config = iconfig.Value;
                var photoPath = Path.Combine(config.PhotosFolder, fname);

                if (!File.Exists(photoPath))
                    return Results.NotFound();

                var mimeType = "image/jpeg";
                return Results.File(photoPath, mimeType);

            });

        }

        public static RouteHandlerBuilder MapPhotoCelebrities(this IEndpointRouteBuilder routebuilder, string? prefix = "/Photos")
        {
            if (string.IsNullOrEmpty(prefix)) prefix = routebuilder.ServiceProvider.GetRequiredService<IOptions<CelebritiesConfig>>().Value.PhotosRequestPath;
            return routebuilder.MapGet($"{prefix}/{{fname}}", async (IOptions<CelebritiesConfig> iconfig, HttpContext context, string fname) =>
            {
                CelebritiesConfig config = iconfig.Value;
                string filePath = Path.Combine(config.PhotosFolder, fname);
                FileStream file = File.OpenRead(filePath);
                BinaryReader sr = new BinaryReader(file);
                BinaryWriter sw = new BinaryWriter(context.Response.BodyWriter.AsStream());
                int n = 0; byte[] buffer = new byte[2048];
                context.Response.ContentType = "image/jpeg";
                context.Response.StatusCode = StatusCodes.Status200OK;
                while ((n = await sr.BaseStream.ReadAsync(buffer, 0, 2048)) > 0) await sw.BaseStream.WriteAsync(buffer, 0, n);
                sr.Close(); sw.Close();
            });
        }

        public static RouteHandlerBuilder MapLifeevents(this IEndpointRouteBuilder routebuilder, string prefix = "/api/Lifeevents")
        {
            var lifeevents = routebuilder.MapGroup("/api/Lifeevents");

            lifeevents.MapGet("/", (IRepostory repo) => repo.GetAllLifeevents());

            lifeevents.MapGet("/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetLifeeventById(id));

            lifeevents.MapGet("/Celebrities/{id:int:min(1)}", (IRepostory repo, int id) => repo.GetLifeeventsByCelebrityId(id));

            lifeevents.MapDelete("/{id:int:min(1)}", (IRepostory repo, int id) => repo.DeleteLifeevent(id));

            lifeevents.MapPost("/", (IRepostory repo, Lifeevent lifeevent) => repo.AddLifeevent(lifeevent));

            return lifeevents.MapPut("/{id:int:min(1)}", (IRepostory repo, int id, Lifeevent lifeevent) => repo.UpdateLifeevent(id, lifeevent));
        }

        public static IApplicationBuilder UseCelebritiesErrorHandler(this IApplicationBuilder app)
        {
            return app.UseMiddleware<ErrorHandlerMiddleware>();
        }

    }
}

