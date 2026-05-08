"use client";

import React, { useEffect, useState } from 'react';
import {
  AutoComplete,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Divider,
  Form,
  Image,
  Input,
  Row,
  Select,
  Space,
  Upload,
  UploadFile,
  UploadProps
} from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { useT } from "@/i18n/client";
import { useNotification } from "@/contexts/NotificationContext";
import { guardianTypes } from "@/types/Client";
import dayjs from "dayjs";
import { PlusOutlined } from "@ant-design/icons";
import { useUser } from "@/contexts/UserContext";
import EventSelector from "@/components/common/EventSelector";
import InputPhone from "@/components/ui/InputPhone";
import { useClient } from "@/lib/queries/clients/useClient";
import { useCountries } from "@/lib/queries/locations/useCountries";
import { useStates } from "@/lib/queries/locations/useStates";
import { useCities } from "@/lib/queries/locations/useCities";
import { useCreateClient } from "@/lib/queries/clients/useCreateClient";
import { useUpdateClient } from "@/lib/queries/clients/useUpdateClient";
import PageHeader from "@/components/common/layout/PageHeader";

const CreateManual: React.FC = () => {
  const { t } = useT();
  const notification = useNotification();
  const router = useRouter();
  const params = useParams();
  const clientId = params.id as string;
  const isEditMode = clientId !== 'new';

  const { defaultDateFormat } = useUser();

  const [form] = Form.useForm();
  const informAddress = Form.useWatch('inform_address', form);
  const informGuardian = Form.useWatch('inform_guardian', form);
  const keepAdding = Form.useWatch('keep_adding', form);
  const autoAssign = Form.useWatch('auto_assign', form);
  const country = Form.useWatch('country', form);
  const state = Form.useWatch('state', form);


  const [uploadRequired, setUploadRequired] = useState<boolean>(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const [assignments, setAssignments] = useState<number[]>([]);

  const createClient = useCreateClient()
  const updateClient = useUpdateClient()

  const {
    data: clientData,
    isLoading: isLoadingClient,
    isError: isClientError
  } = useClient(Number(clientId), isEditMode);

  const { data: countries, isLoading: isLoadingCountries } = useCountries()
  const { data: states, isLoading: isLoadingStates } = useStates(country)
  const { data: cities } = useCities(country, state)

  useEffect(() => {
    if (isEditMode && clientData && !isLoadingClient) {
      form.setFieldsValue({
        ...clientData,
        guardian_name: clientData.guardian?.name,
        guardian_type: clientData.guardian?.type,
        guardian_phone: clientData.guardian?.phone,
        guardian_email: clientData.guardian?.email,
        postal_code: clientData.address?.postalCode,
        street: clientData.address?.street,
        number: clientData.address?.number,
        neighborhood: clientData.address?.neighborhood,
        complement: clientData.address?.complement,
        country: clientData.address?.country,
        state: clientData.address?.state,
        city: clientData.address?.city,
        inform_address: !!clientData.address,
        inform_guardian: !!clientData.guardian?.name,
        birthdate: clientData.birthdate ? dayjs(clientData.birthdate) : null,
      });

      if (clientData.profile?.web) {
        setFileList([{
          uid: '-1',
          name: 'profile.jpg',
          status: 'done',
          url: clientData.profile.web,
        }]);
      }
    } else if (!isEditMode) {
      form.resetFields();
    }
  }, [clientData, isEditMode, isLoadingClient, form]);

  useEffect(() => {
    if (isClientError) {
      notification.error({ title: t('client_not_found') });
      router.back();
    }
  }, [isClientError, router, t]);

  useEffect(() => {
    if (!informAddress) {
      form.setFieldsValue({
        postal_code: undefined, street: undefined, number: undefined, neighborhood: undefined,
        country: undefined, state: undefined, city: undefined, complement: undefined,
      });
    }

    if (!informGuardian) {
      form.setFieldsValue({
        guardian_name: undefined, guardian_type: undefined,
        guardian_email: undefined, guardian_phone: undefined,
      });
    }
  }, [informAddress, informGuardian])

  const handleCountryChange = () => form.setFieldsValue({ state: null, city: null })
  const handleStateChange = async () => form.setFieldsValue({ city: null });

  const isSubmitting = createClient.isPending || updateClient.isPending;
  const isPageLoading = (isEditMode && isLoadingClient);

  const handleSubmit = async (values: any) => {
    try {
      if (!fileList[0]) {
        setUploadRequired(true);
        return;
      }

      if (values.birthdate) {
        values.birthdate = dayjs(values.birthdate).format('YYYY-MM-DD');
      }

      values.assignments = assignments
      const file = fileList[0];

      if (isEditMode) {
        const res = await updateClient.mutateAsync({
          id: Number(clientId),
          values,
          profile: file
        });

        notification.success({ title: res.message });
      } else {
        const res = await createClient.mutateAsync({
          values,
          profile: file
        });

        notification.success({ title: res.message });

        if (keepAdding) {
          setFileList([])
          form.resetFields();
          form.setFieldsValue({
            inform_address: informAddress,
            inform_guardian: informGuardian,
            keep_adding: true,
            auto_assign: autoAssign
          });
          setAssignments([]);
        } else {
          router.push('/app/clients');
        }
      }
    } catch (err: any) {
      notification.warning({ title: err.message });
    }
  }

  const handleBeforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      notification.warning({
        title: t('Invalid_file'),
        description: t('please_select_images_only')
      });
      return Upload.LIST_IGNORE;
    }

    return false;
  }

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview && file.originFileObj) {
      file.preview = URL.createObjectURL(file.originFileObj);
    }
    setPreviewImage(file.url || (file.preview as string))
    setPreviewOpen(true);
  };

  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
    setUploadRequired(false)
    setFileList(newFileList);
  }

  const handleAssignChange = (values: number[]) => {
    setAssignments(values);
  }

  return (
    <>
      <PageHeader title={isEditMode ? t('edit_client') : t('create_new_client')} />

      <div className="flex flex-col items-start gap-4 lg:flex-row">
        <div
          className="w-fit p-2 bg-ant-bg shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-ant-border-sec rounded-lg">
          <div className="mb-2 flex items-center">
            <span
              className="inline-block text-sm text-[#ff4d4f] mr-1"
              style={{ fontFamily: 'SimSun, sans-serif' }}
            >*</span>
            {t('client_photo')}
          </div>
          <div className="min-h-[124px] overflow-hidden">
            <Upload
              className={`antd-upload-w-180 ${uploadRequired ? 'antd-upload-error' : ''}`}
              listType="picture-card"
              fileList={fileList}
              beforeUpload={handleBeforeUpload}
              onPreview={handlePreview}
              onChange={handleChange}
              accept="image/*"
              maxCount={1}
            >
              {fileList.length >= 1 ? null : (
                <button style={{ border: 0, background: 'none' }} type="button">
                  <PlusOutlined />
                  <div className='mt-2 text-ant-text-sec'>Upload</div>
                </button>
              )}
            </Upload>
          </div>

          {uploadRequired &&
            <div className="text-ant-error">
              {t('select_a_photo')}
            </div>
          }

          {previewImage && (
            <Image
              styles={{ root: { display: 'none' } }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
        </div>

        <Card loading={isPageLoading} variant="outlined" className="shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-full">
          <Form form={form} layout="vertical" name="manage_client_form" onFinish={handleSubmit}>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="name" label={t('name')} rules={[{ required: true, message: t('enter_name') }]}>
                  <Input placeholder={t('name')} maxLength={60} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="code" label={t('code')}
                  rules={[{ message: t('enter_code') }]}>
                  <Input placeholder={t('code')} maxLength={20} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col xs={24} md={12}>
                <Form.Item name="birthdate" label={t('birthdate')} rules={[]}>
                  <DatePicker picker="date" style={{ width: '100%' }} maxDate={dayjs()} format={defaultDateFormat} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item name="phone" label={t('phone')} rules={[]}>
                  <InputPhone placeholder={t('phone')} />
                </Form.Item>
              </Col>
            </Row>

            <Row>
              <Form.Item
                name="inform_address"
                valuePropName="checked"
                initialValue={false}
                style={{ marginBottom: 10, marginRight: 10 }}
              >
                <Checkbox>{t('inform_address')}</Checkbox>
              </Form.Item>

              <Form.Item
                name="inform_guardian"
                valuePropName="checked"
                initialValue={false}
                style={{ marginBottom: 10, marginRight: 10 }}
              >
                <Checkbox>{t('inform_guardian')}</Checkbox>
              </Form.Item>

              {!isEditMode && <Form.Item
                name="keep_adding"
                valuePropName="checked"
                initialValue={false}
                style={{ marginBottom: 10 }}
              >
                <Checkbox>{t('keep_adding')}</Checkbox>
              </Form.Item>}

              {!isEditMode && <Form.Item
                name="auto_assign"
                valuePropName="checked"
                initialValue={false}
                style={{ marginBottom: 10 }}
              >
                <Checkbox>{t('auto_assign')}</Checkbox>
              </Form.Item>}
            </Row>

            {autoAssign && (
              <>
                <Divider>{t('assign_client_to_event')}</Divider>

                <EventSelector value={assignments} onChange={handleAssignChange} />
              </>
            )}

            {informGuardian && (
              <>
                <Row gutter={16}>
                  <Divider>{t('guardian')}</Divider>

                  <Col xs={24} md={16}>
                    <Form.Item name="guardian_name" label={t('guardian_name')}
                      rules={[{ required: true, message: t('enter_guardian_name') }]}>
                      <Input placeholder={t('enter_guardian_name')} maxLength={60} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="guardian_type" label={t('guardian_type')}
                      rules={[{ required: true, message: t('select_guardian_type') }]}>
                      <Select
                        placeholder={t('select_guardian_type')}
                        options={guardianTypes.map(guardianType => {
                          return {
                            value: guardianType,
                            label: t(guardianType),
                          }
                        })}
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="guardian_email" label={t('guardian_email')}
                      rules={[{ required: true, message: t('enter_guardian_email'), type: 'email' }]}>
                      <Input placeholder={t('enter_guardian_email')} maxLength={60} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item name="guardian_phone" label={t('guardian_phone')}
                      rules={[{ required: true, message: t('enter_guardian_phone') }]}>
                      <InputPhone placeholder={t('enter_guardian_phone')} maxLength={20} />
                    </Form.Item>
                  </Col>
                </Row>
              </>
            )}

            {informAddress && (
              <>
                <Divider>{t('address')}</Divider>

                <Row gutter={16}>
                  <Col xs={24} sm={12} md={6}>
                    <Form.Item name="postal_code" label={t('postal_code')}
                      rules={[{ required: true, message: t('enter_postal_code') }]}>
                      <Input placeholder={t('postal_code')} maxLength={12} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={16}>
                    <Form.Item name="street" label={t('street')} rules={[{ required: true, message: t('enter_street') }]}>
                      <Input placeholder={t('street')} maxLength={120} />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={8}>
                    <Form.Item name="number" label={t('number')} rules={[{ required: true, message: t('enter_number') }]}>
                      <Input placeholder={t('number')} maxLength={10} />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="neighborhood" label={t('neighborhood')}
                  rules={[{ required: true, message: t('enter_neighborhood') }]}>
                  <Input placeholder={t('neighborhood')} maxLength={40} />
                </Form.Item>

                {/* CAMPOS DE LOCALIZAÇÃO */}
                <Row gutter={16}>
                  <Col xs={24} md={8}>
                    <Form.Item name="country" label={t('country')}
                      rules={[{ required: true, message: t('select_country') }]}>
                      <Select placeholder={t('select_country')}
                        loading={isLoadingCountries}
                        onChange={handleCountryChange}
                        options={countries}
                        showSearch={{
                          filterOption: (input, option) => (
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          )
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="state" label={t('state_province')}
                      rules={[{ required: true, message: t('select_state') }]}>
                      <Select placeholder={t('select_state')}
                        loading={isLoadingStates}
                        disabled={!country || isLoadingStates}
                        onChange={handleStateChange}
                        options={states}
                        showSearch={{
                          filterOption: (input, option) => (
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          )
                        }}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="city" label={t('city')} rules={[{ required: true, message: t('enter_city') }]}>
                      <AutoComplete placeholder={t('enter_or_select')}
                        disabled={!state}
                        options={cities}
                        showSearch={{
                          filterOption: (input, option) => (
                            (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                          )
                        }}
                      >
                        <Input />
                      </AutoComplete>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="complement" label={t('complement')}
                  rules={[{ message: t('enter_complement') }]}>
                  <Input placeholder={t('complement')} maxLength={120} />
                </Form.Item>
              </>
            )}

            <Form.Item className="!mt-4 flex justify-end">
              <Space className="flex justify-end">
                <Button onClick={() => router.back()}>{t('cancel')}</Button>
                <Button type="primary" htmlType="submit" loading={isSubmitting}>
                  {t('save_client')}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>

      </div>

    </>
  );
};

export default CreateManual;