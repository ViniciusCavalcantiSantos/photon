import { Button, Divider } from "antd";
import IconGoogle from "@/components/ui/icons/IconGoogle";
import IconMicrosoft from "@/components/ui/icons/IconMicrosoft";
import IconLinkedin from "@/components/ui/icons/IconLinkedin";
import React from "react";
import { useNotification } from "@/contexts/NotificationContext";
import { useAvailableProviders } from "@/lib/queries/users/useAvailableProviders";
import { useSocialRedirect } from "@/lib/queries/users/useSocialRedirect";

function SocialMediaAuth() {
  const notification = useNotification();
  const { data: availableProviders } = useAvailableProviders()
  const { mutateAsync: redirect, isPending: isRedirecting, variables: activeProvider } = useSocialRedirect()

  const handleSocialogin = async (socialMedia: string) => {
    try {
      const res = await redirect(socialMedia);
      window.location.href = res.url;
    } catch (err: any) {
      notification.error({ title: err.message });
    }
  };

  return (
    <>
      {availableProviders && availableProviders.length !== 0 &&
        <div>
          <h1>
            <Divider className='!text-sm !font-semibold  !text-ant-text-sec'>Ou prossiga com:</Divider>
          </h1>

          <ul className='mb-6 flex flex-col gap-4 '>
            {availableProviders.includes('google') &&
              <li>
                <Button
                  type='text'
                  loading={isRedirecting && activeProvider === 'google'}
                  onClick={() => handleSocialogin('google')}
                  className="flex items-center justify-center w-full !h-auto !px-4 !py-2 !border !border-ant-border"
                  style={{ padding: '16px 8px' }}
                >
                  <IconGoogle />

                  <span className='text-ant-text-sec font-semibold text-base'>Google</span>
                </Button>
              </li>
            }

            {availableProviders.includes('microsoft') &&
              <li>
                <Button
                  type='text'
                  loading={isRedirecting && activeProvider === 'microsoft'}
                  onClick={() => handleSocialogin('microsoft')}
                  className="flex items-center justify-center w-full !h-auto !px-4 !py-2 !border !border-ant-border"
                >
                  <IconMicrosoft />

                  <span className='text-ant-text-sec font-semibold text-base'>Microsoft</span>
                </Button>
              </li>
            }

            {availableProviders.includes('linkedin') &&
              <li>
                <Button
                  type='text'
                  loading={isRedirecting && activeProvider === 'linkedin'}
                  onClick={() => handleSocialogin('linkedin')}
                  className="flex items-center justify-center w-full !h-auto !px-4 !py-2 !border !border-ant-border"
                >
                  <IconLinkedin />

                  <span className='text-ant-text-sec font-semibold text-base'>Linkedin</span>
                </Button>
              </li>
            }
          </ul>
        </div>
      }
    </>
  )
}

export default React.memo(SocialMediaAuth)