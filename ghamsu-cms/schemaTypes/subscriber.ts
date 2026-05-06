interface Field {
  name: string;
  title: string;
  type: string;
  validation?: (Rule: any) => any;
}

interface SubscriberSchema {
  name: string;
  title: string;
  type: string;
  fields: Field[];
}

const subscriber: SubscriberSchema = {
  name: 'subscriber',
  title: 'Subscribers',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required().email(),
    },
    {
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime',
    },
  ],
};

export default subscriber;