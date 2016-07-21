using System.Linq;
using System.Web.Http;
using Breeze.ContextProvider;
using Breeze.WebApi2;
using MyPantry.Model;
using MyPantry.DataAccess;
using Newtonsoft.Json.Linq;

namespace MyPantry.Web.Controllers
{
    [BreezeController]
    public class BreezeController : ApiController
    {
        // Todo: inject via an interface rather than "new" the concrete class
        readonly MyPantryRepository _repository = new MyPantryRepository();

        [HttpGet]
        public string Metadata()
        {
            return _repository.Metadata;
        }

        [HttpPost]
        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _repository.SaveChanges(saveBundle);
        }

        [HttpGet]
        public IQueryable<PantryItem> PantryItems()
        {
            return _repository.PantryItems;
        }

        [HttpGet]
        public IQueryable<Ingredient> Ingredients()
        {
            return _repository.Ingredients;
        }

        [HttpGet]
        public IQueryable<Recipe> Recipes()
        {
            return _repository.Recipes;
        }

        [HttpGet]
        public IQueryable<RecipeIngredient> RecipeIngredients()
        {
            return _repository.RecipeIngredients;
        }

        /// <summary>
        /// Query returing a 1-element array with a lookups object whose 
        /// properties are all Rooms, Tracks, and TimeSlots.
        /// </summary>
        /// <returns>
        /// Returns one object, not an IQueryable, 
        /// whose properties are "rooms", "tracks", "timeslots".
        /// The items arrive as arrays.
        /// </returns>
        [HttpGet]
        public object Lookups()
        {
            //var rooms = _repository.Rooms;
            //var tracks = _repository.Tracks;
            //var timeslots = _repository.TimeSlots;
            //return new { rooms, tracks, timeslots };
            return new { };
        }

        // Diagnostic
        [HttpGet]
        public string Ping()
        {
            return "pong";
        }
    }
}