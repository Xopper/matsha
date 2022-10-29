import { useEffect } from 'react';
import { useParams, useNavigate} from 'react-router-dom'
import swal from 'sweetalert';
import instance from './instances/helpaxios';


const verify = async (slug) => {
	const res = await instance.get(`emailverification/tokenverification/${slug}`);
	return res;
}

const Confirm = () => {
	let {slug} = useParams();
	const navigate = useNavigate();

	useEffect ( () => {
			if(slug && /^[a-zA-Z0-9._-]+$/.test(slug)) {
				(async () => {
					const { data : { status } } = await verify(slug);
					if (status === 0) {
						swal ({
							title : 'YAAAP!',
							text: 'your email have been confirmed',
							icon: 'success',
							buttons : 'close',
						})
					} else {
						swal({
							title : 'NOOOPE!',
							text : 'Something get wrong please try again',
							icon: 'error',
							buttons : 'close',
						})
					}
				})();
				navigate('/auth');
			} else {
				swal({
					title : 'NOOOPE!',
					text : 'Something get wrong please try again',
					icon: 'error',
					buttons : 'close',
				})
			}
			navigate('/auth');
			// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])
	return null;
}

export default Confirm