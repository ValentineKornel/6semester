using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;

namespace DAL003
{
    public class Repository : IRepository
    {
        private static Repository repository;
        private List<Celebrity> _celebrities;
        public static string JSONFilename;
        public string BasePath { get; }
        private int changesCounter = 0;
        private int nextId = 1;

        private Repository(string basePath)
        {
            //BasePath = Path.Combine(Directory.GetCurrentDirectory(), basePath);
            BasePath = basePath;
        }

        public static Repository Create(string basePath)
        {
            if (repository == null)
            {
                repository = new Repository(basePath);
                repository._celebrities = repository.LoadCelebrities();
                int? maxId = repository._celebrities.Max(c => c.Id);
                if (maxId != null) repository.nextId = (int)maxId + 1;
                return repository;
            }
            return repository;
        }


        private List<Celebrity> LoadCelebrities()
        {   
            string path = Path.Combine(BasePath, JSONFilename);
            Console.WriteLine($"Ищем файл по пути: {path}");

            if (File.Exists(path))
            {
                string json = File.ReadAllText(path);
                return JsonConvert.DeserializeObject<List<Celebrity>>(json) ?? new List<Celebrity>();
            }
            return new List<Celebrity>();
        }

        Celebrity[] IRepository.getAllCelebrities()
        {
            return _celebrities.ToArray();
        }
        public string? getPhotoPathById(int id)
        {
            return _celebrities.FirstOrDefault(c => c.Id == id)?.PhotoPath;
        }

        public void Dispose()
        {
            _celebrities.Clear();
        }

        Celebrity? IRepository.getCelebrityById(int id)
        {
            return _celebrities.FirstOrDefault(c => c.Id == id);
        }

        Celebrity[] IRepository.getCelebritiesBySurname(string surname)
        {
            return _celebrities.Where(c => c.Surname.Equals(surname, StringComparison.OrdinalIgnoreCase)).ToArray();
        }

        public int? addCelebrity(Celebrity celebrity)
        {
            //int newId = Guid.NewGuid().GetHashCode();
            if (celebrity.Id == null) celebrity.Id = nextId++;
            _celebrities.Add(celebrity);
            changesCounter++;
            return celebrity.Id;
        }

        public bool deleteSelebrity(int id)
        {
            try
            {
                changesCounter++;
                return _celebrities.Remove(_celebrities.Find(c => c.Id == id));
            }catch(Exception e)
            {
                Console.WriteLine(e.ToString());
                return false;
            }
        }

        public int? updateSelebrity(int id, Celebrity celebrity)
        {
            Celebrity? celeb = _celebrities.Find(ce => ce.Id == id);
            if(celeb != null)
            {
                celeb.Firstname = celebrity.Firstname;
                celeb.Surname = celebrity.Surname;
                celeb.PhotoPath = celebrity.PhotoPath;
                changesCounter++;
                return celeb.Id;
            }
            return null;
        }

        public int SaveChanges()
        {
            string path = Path.Combine(BasePath, JSONFilename);
            Console.WriteLine($"Ищем файл по пути: {path}");

            if (File.Exists(path))
            {
                File.WriteAllText(path, JsonConvert.SerializeObject(_celebrities, Formatting.Indented));
                int changesAmout = changesCounter;
                changesCounter = 0;
                return changesAmout;
            }
            return 0;
           
        }
    }
}
