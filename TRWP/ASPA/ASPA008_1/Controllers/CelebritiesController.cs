using ASPA006_1;
using DAL_Celebrity_MSSQL;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.Extensions.Options;

namespace ASPA008_1.Controllers
{
    public class CelebritiesController : Controller
    {

        IRepostory repo;
        IOptions<CelebritiesConfig> config;
        public CelebritiesController(IRepostory repo, IOptions<CelebritiesConfig> config)
        {
            this.repo = repo;
            this.config = config;
        }
        public record IndexModel(string PhotoRequestPath, List<Celebrity> Celebrities);

        public IActionResult Index()
        {
            return View(new IndexModel(config.Value.PhotosRequestPath, repo.GetAllCelebrities()));
        }

        public record HumanModel(string photosrequestpath, Celebrity celebrity, List<Lifeevent> lifeevents, Dictionary<string, string>? references);
        [InfoAsyncActionFilter(infotype: "Wikipedia")]
        public IActionResult Human(int id)
        {
            IActionResult rc = NotFound();
            Celebrity? celebrity = repo.GetCelebrityById(id);
            Dictionary<string, string>? references = (Dictionary<string, string>?) HttpContext.Items[InfoAsyncActionFilter.Wikipedia];

            if (celebrity != null) rc = View(new HumanModel(config.Value.PhotosRequestPath,
                                                (Celebrity?)celebrity, repo.GetLifeeventsByCelebrityId(id), references));
            return rc;

        }

        public IActionResult NewHumanForm()
        {
            return View("NewHumanForm", config.Value.PhotosRequestPath);
        }


        public record ConfirmModel(string photosrequestpath, string FullName, string Nationality, string PhotoFileName);
        [HttpPost]
        public IActionResult Save(IFormFile upload, string fullname, string Nationality)
        {
            if (upload != null && upload.Length > 0)
            {
                string fileName = Path.GetFileName(upload.FileName);
                string savePath = Path.Combine(config.Value.PhotosFolder, fileName);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    upload.CopyTo(stream);
                }

                var model = new ConfirmModel(config.Value.PhotosRequestPath, fullname, Nationality, fileName);

                return View("ConfirmNewCelebrity", model);
            }

            return RedirectToAction("NewHumanForm");
        }

        [HttpPost]
        public IActionResult AddConfirmed(string FullName, string Nationality, string PhotoFileName)
        {
            Celebrity newCeleb = new Celebrity
            {
                FullName = FullName,
                Nationality = Nationality,
                ReqPhotoPath = PhotoFileName
            };

            repo.AddCelebrity(newCeleb);

            return RedirectToAction("Index");
        }

        public record EditModel(string photosrequestpath, Celebrity? celebrity);
        [HttpGet]
        public IActionResult EditForm(int id)
        {
            Celebrity? celebrity = repo.GetCelebrityById(id);
            if (celebrity == null)
            {
                return NotFound();
            }

            return View("EditForm", new EditModel(this.config.Value.PhotosRequestPath, celebrity));
        }

        [HttpPost]
        public IActionResult EditConfirmed(IFormFile upload, string Id, string FullName, string Nationality, string PhotoFileName)
        {
            Celebrity newCeleb;
            if (upload != null && upload.Length > 0)
            {
                string fileName = Path.GetFileName(upload.FileName);
                string savePath = Path.Combine(config.Value.PhotosFolder, fileName);
                using (var stream = new FileStream(savePath, FileMode.Create))
                {
                    upload.CopyTo(stream);
                }
                newCeleb = new Celebrity
                {
                    Id = int.Parse(Id),
                    FullName = FullName,
                    Nationality = Nationality,
                    ReqPhotoPath = fileName
                };
            }
            else
            {
                newCeleb = new Celebrity
                {
                    Id = int.Parse(Id),
                    FullName = FullName,
                    Nationality = Nationality,
                    ReqPhotoPath = PhotoFileName
                };
            }

            repo.UpdateCelebrity(int.Parse(Id), newCeleb);

            return RedirectToAction("Index");
        }


        [HttpGet]
        public IActionResult DeleteForm(int id)
        {
            Celebrity? celebrity = repo.GetCelebrityById(id);
            if (celebrity == null)
            {
                return NotFound();
            }

            return View("DeleteForm", new EditModel(this.config.Value.PhotosRequestPath, celebrity));
        }

        [HttpPost]
        public IActionResult DeleteConfirm(string Id)
        {
            repo.DeleteCelebrity(int.Parse(Id));
            return RedirectToAction("Index");
        }

    }
}
