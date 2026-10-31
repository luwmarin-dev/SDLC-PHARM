import Courses from "./sections/Courses";
import Hero from "./sections/Hero";
import Services from "./sections/Services";
import Sessions from "./sections/Sessions";
import Stats from "./sections/Stats";
import Stories from "./sections/Stories";
const Home = () => {
  return (
    <div>
      <Hero />
      <Services />
      <Stats />
      <Courses />
      <Stories />
      <Sessions />
    </div>
  );
};

export default Home;
