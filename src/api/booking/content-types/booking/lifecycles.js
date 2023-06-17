const { v4: uuidv4 } = require("uuid");
const { x } = require("../../../../../libs/xendit");

module.exports = {
  async beforeCreate(event) {
    const { data = {} } = event.params;

    // find selected event using entity service
    const selectedEvent = await strapi.entityService.findOne(
      "api::event.event",
      data.event.connect[0].id,
      {
        fields: ["name", "price"],
      }
    );

    const eventPrice = parseInt(selectedEvent.price);

    // calculate total price
    const { discount = 0, qty = 0 } = data;
    const totalPrice = eventPrice * parseInt(qty);
    const discountAmount = totalPrice * parseFloat(discount);
    const finalPrice = totalPrice - discountAmount;

    event.params.data.total_price = finalPrice;
    event.params.data.code = uuidv4();

    // create payment request
    const { QrCode } = x;
    const qrcodeSpecificOptions = {};
    const q = new QrCode(qrcodeSpecificOptions);

    // disabled due to development
    // try {
    //   const res = await q.createCode({
    //     externalID: event.params.data.code,
    //     amount: finalPrice,
    //     type: QrCode.Type.Dynamic,
    //     callbackURL:
    //       "https://webhook.site/959b3a5e-3e13-4cfc-aaa2-2ec21812bb3c",
    //   });

    //   event.params.data.payment_token = res.id;

    //   // // simulate payment
    //   // const payment = await q.simulate({
    //   //   externalID: res.external_id,
    //   //   amount: res.amount,
    //   // });
    // } catch (error) {
    //   console.log(error);
    //   console.error(`QR code creation failed with message: ${error}`);
    // }
  },
  async afterCreate(event) {
    const { result } = event;

    const { id: bookingId, qty = 0 } = result;
    const tickets = [];
    for (let i = 0; i < qty; i++) {
      tickets.push({ code: uuidv4(), booking: bookingId });
    }

    // create tickets using strapi query for bulk insert
    await strapi.db.query("api::ticket.ticket").createMany({
      data: tickets,
    });
  },
};
