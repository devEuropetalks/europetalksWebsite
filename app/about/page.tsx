import ContentWrapper from "@/components/ContentWrapper";
import Image from "next/image";
import { Slideshow } from "@/components/Slideshow";

export default function AboutPage() {
  return (
    <ContentWrapper>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">About EuropeTalks</h1>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">Who We Are</h2>
            <p>
              We are a group of activists from all over Europe who are united in
              one goal &ndash; to boost European cooperation and solidarity!
            </p>
            <p>
              Our main goal is to provide a platform for European democrats, to
              connect like-minded people from all over Europe and beyond and to
              work together for a common European vision, based on social
              democratic and socialist values. We want to enable people to share
              their values and visions on how to further develop and shape the
              European Union.
            </p>
          </section>

          <section className="mb-12 text-center">
            <h2 className="text-3xl font-semibold mb-4">Leadership</h2>
            <p>Mainly responsible for EuropeTalks is:</p>
            <div className="flex items-start gap-6 my-6 justify-center">
              <div className="w-24 h-24 flex-shrink-0">
                <Image
                  src="/images/vivien-costanzo.jpeg"
                  alt="Vivien Costanzo"
                  width={900}
                  height={676}
                  className="rounded-full w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-center">
                <h3 className="text-xl font-semibold mb-2">Vivien Costanzo</h3>
                <p className="text-muted-foreground">
                  Member of the European Parliament,
                  <br />
                  Social Democratic Party of Germany
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">Background</h2>
            <p>
              It all started after the &quot;Europe, we need to talk!&quot;
              &ndash; conference in 2018, which was organized by the Jusos and
              SPD Hessen-Süd in Germany. This was supported by Udo Bullmann, MEP
              and Michael Roth, German Minister Of State For Europe In The
              Foreign Ministry.
            </p>
            <p>
              Activists from all over Europe were invited to talk about common
              issues like social inequality across member states as well as our
              European identity. We looked for collaborations and inspirations
              to find answers to the problems and challenges we face all over
              Europe. At the conference we all saw the need to keep on working
              together on these issues and many more &ndash; direct and without
              intermediary &ndash; as a European grassroot movement. At the end
              of our kick-off event, a resolution was adopted in the manifesto
              &quot;Europe, we need to talk&quot;, which serves as the basis for
              further cooperation and common policy making.
            </p>
            <p>
              We usually discuss Europe in our parties from a national
              perspective. We want to establish a European perspective. Every
              local party and political committee can create an exchange through
              social democratic and socialist partner organizations. This can be
              achieved through local exchange projects, digital networking and
              much more. We link every regional group on a long-term and
              sustainable basis in order make sure Europe is at the centre of in
              our daily party work.
            </p>
            <p>
              We are a group of activists from 14 different countries: Spain,
              France, Lithuania, Belgium, the Netherlands, Germany, Portugal,
              Poland, Italy, Croatia, Ukraine, Austria, Latvia as well as the
              UK. But we are always looking for new activists from all over
              Europe and beyond. Are you interested? Just get in touch with us.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-3xl font-semibold mb-4">How We Work</h2>
            <p>
              We, as Socialists and Social Democrats, must embody the European
              idea and create European networks at every level. Only then can
              European policies be credibly represented and promoted.
            </p>
            <p>
              We make this happen by connecting people in every local
              organization. In order to support individuals to understand
              different point of views, to share political experiences, and to
              work together on solutions to common issues we organize workshops
              and events &ndash; both online and in person.
            </p>
            <p>
              Our workshops tackle specific issues and offer the possibility to
              exchange ideas and find solutions to common European problems. How
              can we better deal with migration and refugees in the European
              Union in a humane way? What can we do to make housing affordable
              and sustainable? What would a socialist international security
              policy look like?
            </p>
            <p>
              These workshops form the basis for our joint work and our
              positioning in terms of specific policy issues. At the end of each
              workshop, we draw up discussion papers, which are carried into the
              individual organizations and which are intended to contribute to
              the formation of policy in these organizations. This is the only
              way we can ensure that European issues are included in the debate
              and discussed with a real European perspective.
            </p>
            <p>
              We also support local party organisations to connect each other.
              Are you part of a local committee and need support in building a
              European network? Then write to us!
            </p>
          </section>
          <section>
            <h2 className="text-3xl font-semibold mb-4 text-center">
              Get to know us
            </h2>
            <div className="mt-6">
              <Slideshow
                interval={5000} // 5 seconds per slide
              />
            </div>
          </section>
        </div>
      </div>
    </ContentWrapper>
  );
}
