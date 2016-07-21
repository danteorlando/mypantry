using System.Collections.Generic;

namespace MyPantry.Model
{
    public class Recipe
    {

        public int Id { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string ImageSource { get; set; }

        public virtual ICollection<RecipeIngredient> RecipeIngredientList { get; set; }
    }
}
