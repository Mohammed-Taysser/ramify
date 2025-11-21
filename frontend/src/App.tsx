import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import localeData from 'dayjs/plugin/localeData';
import weekday from 'dayjs/plugin/weekday';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import { RouterProvider } from 'react-router-dom';
import routes from './apps/routes';
import AntDesignProvider from './providers/AntDesignProvider';
import AuthProvider from './providers/AuthProvider';

import '@ant-design/v5-patch-for-react-19';
import './assets/css/style.css';

dayjs.extend(relativeTime);
dayjs.extend(customParseFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);

function App() {
  return (
    <AntDesignProvider>
      <AuthProvider>
        <RouterProvider router={routes} />
      </AuthProvider>
    </AntDesignProvider>
  );
}

export default App;
