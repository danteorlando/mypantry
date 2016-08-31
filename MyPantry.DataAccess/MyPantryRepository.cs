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
            string amt = saveBundle["entities"][0]["Amount"].ToString();
            // This is a hacky test to see if we are dealing with entities that have the Amount property...
            if (!string.IsNullOrEmpty(amt))
            {
                for (int i = 0; i < saveBundle["entities"].Count(); i++ )
                {
                    amt = saveBundle["entities"][i]["Amount"].ToString();

                    string[] a = amt.Split('/');
                    double dAmount = 0;

                    if (a.Length > 1)
                    {
                        //convert to decimal
                        double wholeNum = 0;
                        double numerator = 0;
                        double denominator = 0;

                        string[] b = amt.Split(' ');
                        if (b.Length > 1)
                        { //whole num and fraction
                            wholeNum = double.Parse(b[0]);
                            string frac = b[1];
                            string[] c = frac.Split('/');
                            numerator = double.Parse(c[0]);
                            denominator = double.Parse(c[1]);
                        }
                        else { //just a fraction
                            string frac = b[0];
                            string[] c = frac.Split('/');
                            numerator = double.Parse(c[0]);
                            denominator = double.Parse(c[1]);
                        }
                        dAmount = wholeNum + (numerator / denominator);
                    }
                    else
                    {
                        dAmount = double.Parse(amt);
                    }

                    saveBundle["entities"][i]["Amount"] = dAmount;

                }

            }

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
