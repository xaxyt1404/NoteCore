import ContactForm from "../common/ContactForm";

export default function ContactSection() {
  return (
    <section id="contacto" className="contact">
      <div className="contact-header">
        <h2>Contáctame</h2>
        <p className="contact-subtitle">
          ¿Tienes una duda o sugerencia? Envíame un mensaje y me pondré en contacto contigo.
        </p>
      </div>

      <ContactForm />
    </section>
  );
}