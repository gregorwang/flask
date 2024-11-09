from flask import Flask, request, jsonify
import os
import random
import redis
from typing import List
from alibabacloud_tea_openapi.client import Client as OpenApiClient
from alibabacloud_tea_openapi import models as open_api_models
from alibabacloud_tea_util import models as util_models
from alibabacloud_openapi_util.client import Client as OpenApiUtilClient
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 初始化Redis连接
redis_client = redis.Redis(
    host='redis-11256.c292.ap-southeast-1-1.ec2.redns.redis-cloud.com',
    port=11256,
    password='vBga3Ncnijcm30xUM9G7dN0leBIZdc3X',
    decode_responses=True  # 自动解码响应
)

class Sample:
    def __init__(self):
        pass

    @staticmethod
    def create_client() -> OpenApiClient:
        config = open_api_models.Config(
            access_key_id=os.environ['ALIBABA_CLOUD_ACCESS_KEY_ID'],
            access_key_secret=os.environ['ALIBABA_CLOUD_ACCESS_KEY_SECRET']
        )
        config.endpoint = 'dysmsapi.aliyuncs.com'
        return OpenApiClient(config)

    @staticmethod
    def create_api_info() -> open_api_models.Params:
        params = open_api_models.Params(
            action='SendSms',
            version='2017-05-25',
            protocol='HTTPS',
            method='POST',
            auth_type='AK',
            style='RPC',
            pathname='/',
            req_body_type='json',
            body_type='json'
        )
        return params

@app.route('/send-sms', methods=['POST'])
def send_sms():
    data = request.get_json()
    phone_number = data.get('phone_number')
    sign_name = data.get('sign_name', '汪家俊的个人网站')
    template_code = data.get('template_code', 'SMS_306490979')

    if not phone_number:
        return jsonify({'success': False, 'message': 'Phone number is required'}), 400

    # 检查发送频率限制
    limit_key = f"sms:limit:{phone_number}"
    if redis_client.exists(limit_key):
        return jsonify({'success': False, 'message': '请等待60秒后再试'}), 429

    try:
        client = Sample.create_client()
        params = Sample.create_api_info()
        
        # 生成验证码
        verification_code = str(random.randint(1000, 9999))
        
        # 存储验证码到Redis
        verify_key = f"sms:verify:{phone_number}"
        redis_client.setex(verify_key, 300, verification_code)  # 5分钟过期
        
        # 设置发送频率限制
        redis_client.setex(limit_key, 60, "1")  # 60秒内不能重复发送

        queries = {
            'PhoneNumbers': phone_number,
            'SignName': sign_name,
            'TemplateCode': template_code,
            'TemplateParam': f'{{"code":"{verification_code}"}}'
        }

        runtime = util_models.RuntimeOptions()
        request_obj = open_api_models.OpenApiRequest(
            query=OpenApiUtilClient.query(queries)
        )

        response = client.call_api(params, request_obj, runtime)
        return jsonify({
            'success': True, 
            'message': '验证码发送成功',
            'response': response
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# 新增：验证码验证接口
@app.route('/verify-sms', methods=['POST'])
def verify_sms():
    data = request.get_json()
    phone_number = data.get('phone_number')
    code = data.get('code')

    if not phone_number or not code:
        return jsonify({'success': False, 'message': '手机号和验证码不能为空'}), 400

    verify_key = f"sms:verify:{phone_number}"
    stored_code = redis_client.get(verify_key)

    if not stored_code:
        return jsonify({'success': False, 'message': '验证码已过期'}), 400

    if code == stored_code:
        # 验证成功后删除验证码
        redis_client.delete(verify_key)
        return jsonify({'success': True, 'message': '验证成功'})
    else:
        return jsonify({'success': False, 'message': '验证码错误'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)

