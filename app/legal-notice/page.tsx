import ContentWrapper from "@/components/ContentWrapper";

export default function LegalNoticePage() {
  return (
    <ContentWrapper>
        <h1 className="text-4xl font-bold mb-8">Legal Notice</h1>

      <div className="prose prose-lg dark:prose-invert max-w-none">
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Website Operator</h2>
          <p>
            This website is operated by EuropeTalks, a non-profit organization
            registered in Germany.
          </p>
          <p>
            EuropeTalks
            <br />
            Musterstraße 123
            <br />
            12345 Musterhausen
            <br />
            Germany
          </p>
          <p>
            Email: info@europetalks.eu
            <br />
            Phone: +49 123 456 789
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Disclaimer</h2>
          <p>
            The content of this website is provided for general information
            purposes only and does not constitute legal or professional advice.
            While we strive to keep the information up-to-date and correct, we
            make no representations or warranties of any kind, express or
            implied, about the completeness, accuracy, reliability, suitability
            or availability with respect to the website or the information,
            products, services, or related graphics contained on the website for
            any purpose.
          </p>
          <p>
            You use the website at your own risk. In no event will we be liable
            for any loss or damage, including without limitation, indirect or
            consequential loss or damage, or any loss or damage whatsoever
            arising from loss of data or profits arising out of, or in
            connection with, the use of this website.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4">Intellectual Property</h2>
          <p>
            The content of this website, including but not limited to text,
            graphics, logos, images, and software, is the property of
            EuropeTalks and is protected by international copyright laws. You
            may not modify, copy, distribute, transmit, display, reproduce or
            create derivative works from the website without the prior written
            permission of EuropeTalks.
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold mb-4">Governing Law</h2>
          <p>
            This website and its use are governed by the laws of Germany. Any
            disputes arising from the use of this website shall be resolved in
            the courts of Germany.
          </p>
        </section>
      </div>
    </ContentWrapper> 
  );
}
