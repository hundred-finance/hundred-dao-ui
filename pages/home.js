import { useRouter } from 'next/router';
import Projects from './projects';

function Home({ changeTheme, ...props }) {
  const router = useRouter();
  const activePath = router.asPath;
  if (activePath.includes('/projects')) {
    return <Projects props={props} changeTheme={changeTheme} />;
  }
  return <Projects props={props} changeTheme={changeTheme} />;
}

export default Home;
