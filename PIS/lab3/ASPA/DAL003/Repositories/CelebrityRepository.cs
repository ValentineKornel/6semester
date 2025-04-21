using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using DAL003.Interfaces;
using Newtonsoft.Json;

namespace DAL003.Repositories
{
    public class Repository : IRepository
    {
        private readonly List<Interfaces.Celebrity> _celebrities;
        public static string JSONFilename { get; set; }
        public string BasePath { get; set; }

        public Repository(string basePath)
        {
            BasePath = basePath;
            _celebrities = LoadCelebrities();
            
        }

        private List<Interfaces.Celebrity> LoadCelebrities()
        {   
            string path = Path.Combine(BasePath, JSONFilename);
            Console.WriteLine($"Ищем файл по пути: {path}");

            if (File.Exists(path))
            {
                string json = File.ReadAllText(path);
                return JsonConvert.DeserializeObject<List<Interfaces.Celebrity>>(json) ?? new List<Interfaces.Celebrity>();
            }
            return new List<Interfaces.Celebrity>();
        }

        Interfaces.Celebrity[] IRepository.getAllCelebrities()
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

        Interfaces.Celebrity? IRepository.getCelebrityById(int id)
        {
            return _celebrities.FirstOrDefault(c => c.Id == id);
        }

        Interfaces.Celebrity[] IRepository.getCelebritiesBySurname(string surname)
        {
            return _celebrities.Where(c => c.Surname.Equals(surname, StringComparison.OrdinalIgnoreCase)).ToArray();
        }
    }
}
