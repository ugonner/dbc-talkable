import { Redirect, Route } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { ellipse, phonePortrait, square, triangle } from "ionicons/icons";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import "@ionic/react/css/palettes/dark.system.css";

/* Theme variables */
import "./theme/variables.css";
import { AdminBoard } from "./pages/admin/AdminBoard";
import { TalkableHome } from "./pages/talkable/TalkableHome";
import { ChatRoomPage } from "./pages/talkable/ChatRoomPage";
import { TalkableContextProvider } from "./contexts/talkables/talkable";
import { TalkableUser } from "./pages/talkable/TalkableUser";
import { AsyncHelperProvider } from "./contexts/async-helpers";

setupIonicReact();

const App: React.FC = () => (
  <IonApp>
    <TalkableContextProvider>
      <AsyncHelperProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path={"/talkable"} component={TalkableHome} />

            <Route
              exact
              path={"/talkable/chat-room/:chatId"}
              component={ChatRoomPage}
            />

            <Route exact path="/hub" component={TalkableUser} />

            <Route exact path="/">
              <Redirect to="/hub" />
            </Route>
            <Route path={"/admin"} component={AdminBoard}></Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </AsyncHelperProvider>
    </TalkableContextProvider>
  </IonApp>
);

export default App;
