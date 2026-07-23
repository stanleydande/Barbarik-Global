import capBlack from '../assets/cap_black.png'
import capWhite from '../assets/cap_white.png'
import hatsProduct from '../assets/hats_product.png'
import shirtsProduct from '../assets/shirts_product.png'
import magazinesProduct from '../assets/magazines_product.png'
import collabsProduct from '../assets/collabs_product.png'

export const categories = ['Hats', 'Shirts', 'Magazines', 'Collabs']

export const products = {
  Hats: [
    {
      id: 'h1',
      name: 'Classic Cap [Black]',
      price: 45.0,
      image: capBlack,
      description:
        'A timeless structured six-panel cap crafted from premium cotton twill. Features an adjustable strap and embroidered logo. Perfect for everyday wear.',
    },
    {
      id: 'h2',
      name: 'Classic Cap [White]',
      price: 45.0,
      image: capWhite,
      description:
        'The same iconic silhouette in crisp white. Lightweight, breathable, and built to last — a wardrobe essential.',
    },
    {
      id: 'h3',
      name: 'Bucket Hat [Stone]',
      price: 50.0,
      image: hatsProduct,
      description:
        'Relaxed silhouette bucket hat in a warm stone colourway. Crafted from 100% cotton canvas with a downward-sloping brim for a laid-back summer look.',
    },
    {
      id: 'h4',
      name: 'Beanie [Black]',
      price: 38.0,
      image: hatsProduct,
      description:
        'A heavyweight ribbed knit beanie in classic black. Slouchy fit, double-lined cuff, and made from a soft wool-acrylic blend for warmth and comfort.',
    },
    {
      id: 'h5',
      name: 'Beanie [Grey]',
      price: 38.0,
      image: hatsProduct,
      description:
        'Same great beanie silhouette in a versatile grey. Pairs effortlessly with any outfit. Machine washable and built to keep you warm all season.',
    },
    {
      id: 'h6',
      name: 'Trucker Cap [White]',
      price: 42.0,
      image: hatsProduct,
      description:
        'Retro-inspired mesh back trucker cap in white. Breathable open-mesh panels keep you cool while the structured foam front holds its shape.',
    },
  ],
  Shirts: [
    {
      id: 's1',
      name: 'Essential Tee [Black]',
      price: 55.0,
      image: shirtsProduct,
      description:
        'Our foundational heavyweight tee in deep black. Crafted from 240gsm organic cotton with a relaxed fit and dropped shoulders. The perfect blank canvas.',
    },
    {
      id: 's2',
      name: 'Essential Tee [White]',
      price: 55.0,
      image: shirtsProduct,
      description:
        'The Essential Tee in clean white. Same heavyweight organic cotton construction, same perfect fit — made to be worn and washed endlessly.',
    },
    {
      id: 's3',
      name: 'Oversized Shirt [Stone]',
      price: 68.0,
      image: shirtsProduct,
      description:
        'A boxy, oversized woven shirt in a warm stone tone. Crafted from 100% linen-cotton blend for a relaxed, breathable feel. Features a button-up front and chest pocket.',
    },
    {
      id: 's4',
      name: 'Long Sleeve [Black]',
      price: 62.0,
      image: shirtsProduct,
      description:
        'Heavyweight long-sleeve tee in black. Same 240gsm organic cotton as our Essential Tee, now with full-length sleeves and a slightly cropped body.',
    },
    {
      id: 's5',
      name: 'Graphic Tee [White]',
      price: 58.0,
      image: shirtsProduct,
      description:
        'Premium white tee featuring original studio artwork screen-printed in water-based ink. Limited runs ensure each piece stays exclusive.',
    },
    {
      id: 's6',
      name: 'Button Up [Off White]',
      price: 74.0,
      image: shirtsProduct,
      description:
        'A refined off-white button-up shirt in a relaxed, oversized cut. Made from a breathable cotton-linen blend with horn-effect buttons and a clean, minimal finish.',
    },
  ],
  Magazines: [
    {
      id: 'm1',
      name: 'Issue No. 01',
      price: 15.0,
      image: magazinesProduct,
      description:
        'The debut issue. 96 pages exploring the intersection of streetwear, art, and culture. Features interviews, editorials, and original photography. Printed on uncoated stock.',
    },
    {
      id: 'm2',
      name: 'Issue No. 02',
      price: 15.0,
      image: magazinesProduct,
      description:
        'Issue two goes deeper — new voices, new cities, new ideas. 104 pages of curated content including collaborator spotlights and behind-the-scenes studio access.',
    },
    {
      id: 'm3',
      name: 'Issue No. 03',
      price: 18.0,
      image: magazinesProduct,
      description:
        'Our largest issue to date. 120 pages covering the seasonal collection, studio conversations, travel diaries, and an exclusive collab feature. Collector\'s edition.',
    },
  ],
  Collabs: [
    {
      id: 'c1',
      name: 'Collab Cap [Limited]',
      price: 65.0,
      image: collabsProduct,
      description:
        'Limited edition collaborative cap produced with an iconic creative partner. Features co-branded detailing, premium materials, and a numbered certificate of authenticity.',
    },
    {
      id: 'c2',
      name: 'Collab Tee [Limited]',
      price: 85.0,
      image: collabsProduct,
      description:
        'A rare limited run tee born from a true creative partnership. Features exclusive co-designed artwork on heavyweight organic cotton. Once it\'s gone, it\'s gone.',
    },
    {
      id: 'c3',
      name: 'Collab Hoodie [Limited]',
      price: 120.0,
      image: collabsProduct,
      description:
        'The crown jewel of our collab series. A premium heavyweight hoodie with embroidered co-branding, brushed fleece lining, and a silhouette built for the ages. Strictly limited.',
    },
  ],
}
