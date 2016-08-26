using System.Linq;
using Breeze.ContextProvider;
using Breeze.ContextProvider.EF6;
using Newtonsoft.Json.Linq;
using MyPantry.Model;

namespace MyPantry.DataAccess
{
    public class MyPantryRepository
    {
        private readonly EFContextProvider<MyPantryDbContext>
            _contextProvider = new EFContextProvider<MyPantryDbContext>();

        private MyPantryDbContext Context { get { return _contextProvider.Context; } }

        public string Metadata
        {
            get { return _contextProvider.Metadata(); }
        }

        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _contextProvider.SaveChanges(saveBundle);
        }

        public IQueryable<PantryItem> PantryItems
        {
            get { return Context.PantryItems; }
        }

        public IQueryable<Ingredient> Ingredients
        {
            get { return Context.Ingredients; }
        }
        public IQueryable<Recipe> Recipes
        {
            get { return Context.Recipes; }
        }

        public IQueryable<RecipeIngredient> RecipeIngredients
        {
            get { return Context.RecipeIngredients;  }
        }

        public IQueryable<Unit> Units
        {
            get { return Context.Units; }
        }
    }
}
