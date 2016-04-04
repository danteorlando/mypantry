
using System.ComponentModel.DataAnnotations.Schema;

namespace MyPantry.Model
{
    public class PantryItem
    {

        public int Id { get; set; }

        public int IngredientId { get; set; }

        public string Name { get; set; }

        public string Description { get; set; }

        public string ImageSource { get; set; }

        //[ForeignKey("IngredientId")]
        public virtual Ingredient Ingredient { get; set; }
    }
}
