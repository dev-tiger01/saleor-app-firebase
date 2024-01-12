import admin from 'firebase-admin';
import { getApps, getApp } from "firebase-admin/app";

// TODO
// Pull from app configuration
const serviceAccount = {
    "type": "service_account",
    "project_id": "santafoo-onfleet-order-status",
    "private_key_id": "7da79bb59b081657833da164fa43e73383648ee8",
    "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDb6/SHqoiVLq/+\navvcHEA6OlrOH6+1lLHhfmzLsbEfHXeGGgMNJqVVGAFl/I+vhG8sk/Snh0jFPtcm\niJ2b11y8EpGbjRQSC/b9tJdc5ZxPFs54lDE9RL/rp0NLFIEalzjTaTogaB2sSmo2\npA4MbRl4P/ti8myExp2xcyto6qp5NjL+9sAarzgV/ixSJlpcRlyPZKcjR14RvKBs\nuerqetjcHu6dVl4VyLUe5y9b0SBpnCAEZEjUTT1qnzm/lbLzwhP8G3xqr1ano5Fh\nyi6VwzC/OYeMQfT96/EeBn3vso41NSAhldt+CnIRHr3a8+17iHF6cIoGqAlRKTL1\norCb+aXHAgMBAAECggEAPhM/fe22SLmZZqxG9A2rWWQwTl8mRxA2F2qKhgJdduVn\n39vGwbcHUtoIRwO/gPDWOpR2qbTnZvmCXDeSmTL0U4fAPtJW+HMVH+6SDOAouzA6\nTlGyBlO6Ame/eFlMybcmjJH2nMAWpBOLIGo1Ju/CkS0qJXc9B0tSpoxWE/Ks9LJA\nLgJHYb7B4CKFzz1vITKIWT48grlm+UBK3w6UAZKGSAsRRXWcuiHzNE2bJiYrvsoQ\ncGD6vc/lKespu/94nhVf4ZgXfghqis7+/iY/x406nv3RhHGOMhBjruj38U8soyUo\nDO6zT3ynOgW4SknefKOQ4FYzeoaVjm7888z4r8DM6QKBgQD2cpFJwXDQPpdLB0Mz\nfcIWfDWDJg09pKahTpAabpAJM+yO7Tez8y9IzUxZTAFemu3alCP4GkpihcXpfs7B\nUGrPDD94Qg68MhrdZYyqZQQg/qP5kUjtRShX4fxECM1bmuDnxHgVAu2KIqAoh2n3\n372rh5+mWzVBBDlXsw6MLpdOOQKBgQDkci3TA5JfMYzeZ0nU8NSPUFZbT5rLxWVD\nsSQFnBemww9u11ycs3hSlOuPOv3ZY7VOIVCfdZblzTbeogjUX/PCv1Oau1XfNwJQ\n0DVTHsa9YTa+Z/szcbwC6yRnlJtzWdXamoJm5khGOlUsPXTmTXS3J++NVtJ/mq8A\ndIgN3BiT/wKBgDoxVVM4JR5XGTxzK5AWCuVqUOx16Lx8i4gdV/OV1dcGdr5ND1Ej\nhC/JolSXmN8w8CcjwdaMxrG66r+23LVS+tWHC9mmp3oSzrsmhm+ZyL7NwgRlJPY5\n1UvjJcEe3vbZfG/duYkklth+UpkfWItaPpwpOy557Po8OBoYQsAhJEMpAoGAbFu0\nXLj+/uRT+1Jm9Phe+rOSorE5rZouFFO70GVf2pv/gAXrSfDfC9zTdxb2Pd1LrImk\n4l42ez5B3oxhP8tbpm52S5i8fKptEMQR5yFcB4xLGTndL2OtWH0MwYz9x1M/Wveb\nDxAADD+zEs772hm3WQE6YYJjSl+mzsJ3notdpSUCgYApLmkwNP3z/G2Ldyi6Xl08\nMPWJOoij2OzgUkSWI14KxaYCJi7usi+bboXYKTMfMMtsH6GVkfc8rxDM8MXO0oc2\n+f5BEU8xq3CvYq9FY37hxDG7kj5eaSPQ2undRKSl5ZSwNUaPdJU19pKB9y9a72Ls\n8bM3jaBFV7/8xtVFrxzeeQ==\n-----END PRIVATE KEY-----\n",
    "client_email": "santafoo-saleor-app-firebase@santafoo-onfleet-order-status.iam.gserviceaccount.com",
    "client_id": "101278266066662341984",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/santafoo-saleor-app-firebase%40santafoo-onfleet-order-status.iam.gserviceaccount.com",
    "universe_domain": "googleapis.com"
}

const FirebaseAdmin = admin.apps.length === 0 ? 
    admin.initializeApp({credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)}) :
    admin.app();

export default FirebaseAdmin