import React from 'react'


function Products() {
  return (
  <div className="container">
    <div className="card">
      <div className="card-img">
        <img src="butter-caramel.png" alt="Butter Caramel Pecan" />
        <span className="badge">70g</span>
        <span className="badge">70g</span>
      </div>
      <h3>Loco Love Butter Caramel Pecan with Cinnamon Spice Twin Pack</h3>
      <div className="nutrition">
        <div><span>Calories</span><br />0cal</div>
        <div><span>Protein</span><br />0g</div>
        <div><span>Carbs</span><br />0g</div>
        <div><span>Fat</span><br />0g</div>
      </div>
      <p className="price">$12.50</p>
      <button className="btn">🛒 ADD TO CART</button>
    </div>

    <div className="card">
      <div className="card-img">
        <img src="almond-caramel.png" alt="Almond Caramel Crunch" />
        <span className="badge">70g</span>
      </div>
      <h3>Loco Love Almond Caramel Crunch with Astragalus Root Twin Pack</h3>
      <div className="nutrition">
        <div><span>Calories</span><br />0cal</div>
        <div><span>Protein</span><br />0g</div>
        <div><span>Carbs</span><br />0g</div>
        <div><span>Fat</span><br />0g</div>
      </div>
      <p className="price">$12.50</p>
      <button className="btn">🛒 ADD TO CART</button>
    </div>

    <div className="card">
      <div className="card-img">
        <img src="peanut-butter.png" alt="Peanut Butter Caramel" />
        <span className="badge">70g</span>
      </div>
      <h3>Loco Love Peanut Butter Caramel with Tremella Mushroom Twin Pack</h3>
      <div className="nutrition">
        <div><span>Calories</span><br />0cal</div>
        <div><span>Protein</span><br />0g</div>
        <div><span>Carbs</span><br />0g</div>
        <div><span>Fat</span><br />0g</div>
      </div>
      <p className="price">$12.50</p>
      <button className="btn">🛒 ADD TO CART</button>
    </div>
  </div>
)
}

export default Products
