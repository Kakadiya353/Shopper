import React from 'react';

// import { useParams } from 'react-router-dom';
import DescriptionBox from '../Components/DescriptionBox/DescriptionBox';
import RelatedProducts from '../Components/RelatedProducts/RelatedProducts';

const Navbar = () => {

  // const { productId } = useParams();
  //const product = all_product.find((e) => e.id === Number(productId))
  return (
    <div>
      {/* <Breadcrum product={product} />
      <ProductDisplay product={product} /> */}
      <DescriptionBox />
      <RelatedProducts />
    </div>
  );
};

export default Navbar