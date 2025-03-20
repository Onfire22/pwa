import { useEffect, useRef, useState } from "react";
import { Link } from "react-router";
import { savePendingRequest, showNotification } from "../../utils";
import { useBarcodeScanner } from "../../utils/barcodeDetection";
import { getCityName } from "../../utils/geolocation";
import { registerBackgroundSync } from '../../utils/backgroundFetchApi';
import { requestWakeLock } from "../../utils/wakeLock";
import './style.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const { codes, startBarcodeScanner } = useBarcodeScanner();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);
  const [location, setLocation] = useState({});
  const [city, setCity] = useState('');
  const [isVideoShown, setIsVideoShown] = useState(false);

  const camRef = useRef(null);

  const getUsers = async () => {
    if (navigator.onLine) {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users');
        showNotification('Успешно', 'Список успешно загружен', '/icons/mail.svg');
        const data = await response.json();
        setUsers(data);
      } catch (e) {
        showNotification('Ошибка', 'Список не загружен, произошла ошибка', '/icons/error.svg')
        console.log(e);
      }
    } else {
      await savePendingRequest({ url: 'https://jsonplaceholder.typicode.com/users', method: 'GET' })
      const swReg = await navigator.serviceWorker.ready;
      await swReg.sync.register('sync-data');
    }
  };

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SYNC_COMPLETE') {
          setUsers(event.data.data[0]);
        }
      });
    }
  }, []);

  useEffect(() => {
    registerBackgroundSync();
    requestWakeLock();
  }, []);

  useEffect(() => {
    if (isVideoShown && camRef?.current) {
      startBarcodeScanner(camRef.current, setIsVideoShown);
    }
  }, [isVideoShown, startBarcodeScanner]);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault(); 
      setDeferredPrompt(e);
      setShowButton(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(position);
          getCityName(position.coords.latitude, position.coords.longitude)
            .then(data => setCity(data.display_name));
      },
      (error) => error,
    )}
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`Результат установки: ${outcome}`);
      setDeferredPrompt(null);
      setShowButton(false);
    }
  };

  const handleCloseVideo = () => {
    setIsVideoShown(false);
    camRef.current.remove();
  }

  return (
    <div className="page">
      {isVideoShown && 
        <div className="camera">
          <video className="video" ref={camRef} />
          <button className="video_close" onClick={handleCloseVideo}>X</button>
        </div>
      }
      <header className="header">
        <ul className="header__menu">
          <li className="header__menu-item">
            <Link className="header__menu-button" to='/profile'>Мой профиль</Link>
          </li>
          <li className="header__menu-item">
            {showButton && <button className="header__menu-button" onClick={handleInstallClick}>Установить</button>}
          </li>
          <li className="header__menu-item">
            <button className="header__menu-button" type="button" onClick={() => setIsVideoShown(true)}>Сканировать qr код</button>
          </li>
          <li className="header__menu-item">
            <button className="header__menu-button" type="button" onClick={getUsers}>Запросить данные</button>
          </li>
        </ul>
      </header>
      <div className="qr_codes">
        <h3>Найденные QR-коды:</h3>
        {codes.length > 0 ? (
          codes.map((code, index) => <p className="qr_code" key={index}>{code.rawValue}</p>)
        ) : (
          <p>Нет данных</p>
        )}
      </div>
      <div className="location">
        <h3>Ваше местоположение:</h3>
        <div>Широта: {location?.coords?.latitude || '-'}</div>
        <div>Долгота: {location?.coords?.longitude || '-'}</div>
        <div>Город: {city}</div>
      </div>
      <div className="container">
        {users.map(({ id, name, phone, username, email }) => {
          return (
            <div className="user" key={id}>
              <p className="user_info">ФИО: {name}</p>
              <p className="user_info">Телефон: {phone}</p>
              <p className="user_info">Имя: {username}</p>
              <p className="user_info">Почта: {email}</p>
            </div>
          )
        })}
      </div>
    </div>
  );
};

export default Users;
