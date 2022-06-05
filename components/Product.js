import React from 'react';
import styles from "../styles/Product.module.css";
import Buy from './Buy'

export default function Product({ product }) {
  const { id, name, price, description, image_url } = product;

  return (
    <div className={styles.product_container}>
      <div className={styles.image_container}>
        <img className={styles.product_image} src={image_url} alt={name} />
      </div>
      <div className={styles.product_details}>
        <div className={styles.product_text}>
          <div className={styles.product_title}>{name}</div>
          <div className={styles.product_description}>{description}</div>
        </div>
        <div className={styles.product_action}>
          <div className={styles.product_price}>{price} USDC/SOL</div>
          {/* I'm hardcoding these for now, we'll fetch the hash from the API later*/}
          {/* <IPFSDownload filename="emojis.zip" hash="QmWWH69mTL66r3H8P4wUn24t1L5pvdTJGUTKBqT11KCHS5" cta="Download emojis"/> */}
          <div className={styles.buttons_container}>
            <div className={styles.usdc_button}>
              <Buy itemID={id} type={'USDC'} />
            </div>
            <div className={styles.sol_button}>
              <Buy itemID={id} type={'SOL'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}