import React from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import { divIcon } from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


function MyMap({setGetLan}) {
  useMapEvents({
    click: (e) => {
      setGetLan({lat : e.latlng.lat,
        lng : e.latlng.lng})
    },
 
  })
  return null
}



const Map = ({getLan, setGetLan}) => {
	const iconMarkup = renderToStaticMarkup(
    	<FontAwesomeIcon icon={faLocationDot} size="2x" className='text-red-600'/>
	);
	const customMarkerIcon = divIcon({
		className: 'Leaflet',
		html: iconMarkup
	});

  return (
      
       <MapContainer center={getLan} zoom={13} scrollWheelZoom={true} eventHandlers={{
              click:(event)=>{
              event.latlng.lat();
                }}}>
    <TileLayer
      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
    />
    <Marker position={getLan} icon={customMarkerIcon} className="leaflet-marker-icon">
    </Marker>
    <MyMap setGetLan={setGetLan}/>
  </MapContainer>
   
  )
}

export default Map