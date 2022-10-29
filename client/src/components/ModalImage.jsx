import  React ,{ useState, useRef, useEffect } from "react";


export default function ModalImage({visible, setVisible, imag}) {
    const [showModal, setShowModal] = useState(visible);
	const ModalRef = useRef(0);
	const [photo, setPhoto] = useState("")
	useEffect(() => {
		setPhoto(imag);
		setShowModal(visible);
		const HanleModal = (event) => {
			if (ModalRef.current && !ModalRef.current.contains(event.target)) {
				setVisible(false)
			  }    
		}
		if (showModal)
			document.addEventListener('click',HanleModal,true);
		return () => {
		  document.removeEventListener('click',HanleModal,true);
		}
	  }, [showModal, visible, imag, setVisible])

    return (
        <>
        	{showModal ? (
				<>
            	<div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-50 outline-none focus:outline-none">
					<div ref={ModalRef} className="w-[50%] h-[50%] flex justify-center items-center p-10 bg-transparent gap-10 rounded-xl">
						<img src={photo} className="border rounded-xl" alt="al"></img>
					</div>
				</div>
				<div className="opacity-90 fixed inset-0 z-40 bg-black "></div>
				</>
    		) : null}
        </>
    );
}