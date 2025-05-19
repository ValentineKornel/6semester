using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using System.Text.Json;

namespace ANC25_WEBAPI_DLL
{
    public static partial class CelebritiesAPIExtensions
    {
        public static IServiceCollection AddCelebritiesServices(this WebApplicationBuilder builder)
        {
            builder.Services.AddScoped<IRepository, Repository>((IServiceProvider p) => {

                CelebritiesConfig config = p.GetRequiredService<IOptions<CelebritiesConfig>>().Value;
                return new Repository(config.ConnectionString);
            });

            builder.Services.AddSingleton<CelerbrityTitles>((p) => new CelerbrityTitles());

            builder.Services.AddSingleton<CountryCodes>((p) => new CountryCodes(
                                                 p.GetRequiredService<IOptions<CelebritiesConfig>>().Value.ISO3166alpha2Path
             ));
            return builder.Services;
        }

        public class CountryCodes : List<CountryCodes.ISOCountryCodes>
        {
            public record ISOCountryCodes(string code, string countryLabel);

            public CountryCodes(string jsoncountrycodespath) : base()
            {
                if (File.Exists(jsoncountrycodespath))
                {
                    FileStream fs = new FileStream(jsoncountrycodespath, FileMode.OpenOrCreate, FileAccess.Read);
                    List<ISOCountryCodes>? cc = JsonSerializer.DeserializeAsync<List<ISOCountryCodes>?>(fs).Result;
                    if (cc != null) this.AddRange(cc);
                }
            }
        }

        public class CelerbrityTitles
        {
            public CelerbrityTitles()
            {

            }
            public string Head { get; } = "Celebrties Dictionary  Internet Service";
            public string Title { get; } = "Celebrties";
            public string Copyright { get; } = @"Copyright BSTU";
        }

    }
}
