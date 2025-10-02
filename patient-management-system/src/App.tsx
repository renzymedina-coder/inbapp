import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import PrivateRoute from './components/auth/PrivateRoute';
import PatientList from './components/patients/PatientList';
import PatientDetails from './components/patients/PatientDetails';
import PatientForm from './components/patients/PatientForm';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Loading from './components/common/Loading';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <PrivateRoute path="/patients" component={PatientList} />
        <PrivateRoute path="/patient/:id" component={PatientDetails} />
        <PrivateRoute path="/edit-patient/:id" component={PatientForm} />
        <PrivateRoute path="/add-patient" component={PatientForm} />
        <Route path="/" exact>
          <Loading />
        </Route>
      </Switch>
      <Footer />
    </Router>
  );
};

export default App;