import axios from 'axios';
import { showAlert } from './alert';

const stripe = Stripe(
  'pk_test_51QL1Vd05J3yHpeQocBO3342kAtRBWVEW1Ob5R7LCKaIGNgZpHWDF01ngRop7hbiwH8smHhITl9IiznetTnA3DLtc00KJP5Xhh1',
);

export const bookTour = async (tourId) => {
  try {
    //get checkout session form endpoint
    const session = await axios(
      `http://localhost:8000/api/v1/bookings/checkout-session/${tourId}`,
    );
    console.log(session);
    //create checkout form + charge the credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (error) {
    showAlert('error', error);
  }
};
