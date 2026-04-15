import * as wpElement from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import {
	Card,
	CardBody,
	CardHeader,
	SelectControl,
	Button,
	Notice,
	Spinner,
	__experimentalVStack as VStack,
	__experimentalHStack as HStack,
} from '@wordpress/components';
import apiFetch from '@wordpress/api-fetch';

const {
	models: modelsByCapability = {},
	preferences: initialPreferences = {},
	nonce,
	optionName,
} = window.aiamSettings || {};

apiFetch.use( apiFetch.createNonceMiddleware( nonce ) );

const CAPABILITIES = {
	text_generation: __( 'Text Generation', 'ai-model-preferences' ),
	image_generation: __( 'Image Generation', 'ai-model-preferences' ),
	vision: __( 'Vision / Multimodal', 'ai-model-preferences' ),
};

const DEFAULT_OPTION = {
	value: '',
	label: __( '\u2014 Use WordPress Default \u2014', 'ai-model-preferences' ),
};

function SettingsApp() {
	const { useState } = wpElement;

	const [ preferences, setPreferences ] = useState(
		initialPreferences || {}
	);
	const [ isSaving, setIsSaving ] = useState( false );
	const [ notice, setNotice ] = useState( null );

	const handleChange = ( capKey, value ) => {
		setPreferences( ( prev ) => ( { ...prev, [ capKey ]: value } ) );
	};

	const handleSave = async () => {
		setIsSaving( true );
		setNotice( null );
		try {
			await apiFetch( {
				path: '/wp/v2/settings',
				method: 'POST',
				data: { [ optionName ]: preferences },
			} );
			setNotice( {
				type: 'success',
				message: __( 'Settings saved.', 'ai-model-preferences' ),
			} );
		} catch ( error ) {
			setNotice( {
				type: 'error',
				message:
					error.message ||
					__( 'An error occurred while saving.', 'ai-model-preferences' ),
			} );
		} finally {
			setIsSaving( false );
		}
	};

	return (
		<div className="aiam-settings-app">
			{ notice && (
				<Notice
					status={ notice.type }
					isDismissible
					onRemove={ () => setNotice( null ) }
					className="aiam-notice"
				>
					{ notice.message }
				</Notice>
			) }

			<Card className="aiam-card">
				<CardHeader>
					<strong>
						{ __( 'Model Preferences', 'ai-model-preferences' ) }
					</strong>
				</CardHeader>
				<CardBody>
					<VStack spacing={ 6 }>
						{ Object.entries( CAPABILITIES ).map(
							( [ capKey, capLabel ] ) => {
								const capModels =
									modelsByCapability[ capKey ] || [];
								const options = [ DEFAULT_OPTION, ...capModels ];

								return (
									<SelectControl
										key={ capKey }
										label={ capLabel }
										value={ preferences[ capKey ] || '' }
										options={ options }
										onChange={ ( value ) =>
											handleChange( capKey, value )
										}
										size="__unstable-large"
										__nextHasNoMarginBottom
										help={
											capModels.length === 0
												? __(
														'No configured AI providers found for this capability.',
														'ai-model-preferences'
												  )
												: undefined
										}
									/>
								);
							}
						) }
					</VStack>
				</CardBody>
			</Card>

			<HStack
				justify="flex-start"
				className="aiam-save-row"
			>
				<Button
					variant="primary"
					onClick={ handleSave }
					isBusy={ isSaving }
					disabled={ isSaving }
					size="compact"
				>
					{ isSaving
						? __( 'Saving\u2026', 'ai-model-preferences' )
						: __( 'Save Changes', 'ai-model-preferences' ) }
				</Button>
			</HStack>
		</div>
	);
}

function mount() {
	const rootEl = document.getElementById( 'aiam-settings-root' );
	if ( ! rootEl ) {
		return;
	}
	const { createRoot, render } = wpElement;
	if ( typeof createRoot === 'function' ) {
		createRoot( rootEl ).render( <SettingsApp /> );
	} else if ( typeof render === 'function' ) {
		render( <SettingsApp />, rootEl );
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', mount );
} else {
	mount();
}
