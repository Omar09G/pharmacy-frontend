import React from 'react';

type ReceiptItem = {
  name?: string;
  qty?: number;
  unitPrice?: number;
  subtotal?: number;
};

interface ReceiptPrintProps {
  storeName?: string;
  items?: ReceiptItem[];
  subtotal?: number;
  total?: number;
  totalDiscount?: number;
  customerName?: string;
  notes?: string;
  paymentMethod?: string;
  reference?: string;
  createdAt?: string;
  width?: number;
  currency?: string;
}

const ReceiptPrint = React.forwardRef<HTMLDivElement, ReceiptPrintProps>(
  (
    {
      storeName = 'Farmacia Santo Niño',
      items = [],
      subtotal = 0,
      total = 0,
      totalDiscount = 0,
      customerName,
      notes,
      paymentMethod,
      reference,
      createdAt,
      width = 280,
      currency = '$',
    },
    ref,
  ) => {
    const style: React.CSSProperties = {
      width: `${width}px`,
      padding: 8,
      fontFamily: 'monospace',
      fontSize: 12,
      color: '#000',
    };

    return (
      <div ref={ref} style={style}>
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>{storeName}</div>
          {createdAt && <div>{createdAt}</div>}
          {paymentMethod && <div>{paymentMethod}</div>}
        </div>

        <div>
          {items.map((it, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 4,
              }}
            >
              <div style={{ width: '55%' }}>{it.name}</div>
              <div style={{ width: '10%', textAlign: 'center' }}>{it.qty}</div>
              <div style={{ width: '15%', textAlign: 'right' }}>
                {currency}
                {Number(it.unitPrice ?? 0).toFixed(2)}
              </div>
              <div style={{ width: '20%', textAlign: 'right' }}>
                {currency}
                {Number(it.subtotal ?? 0).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <hr style={{ margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>Subtotal</div>
          <div>
            {currency}
            {Number(subtotal).toFixed(2)}
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>Descuento</div>
          <div>
            -{currency}
            {Number(totalDiscount).toFixed(2)}
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontWeight: 'bold',
            marginTop: 6,
          }}
        >
          <div>Total</div>
          <div>
            {currency}
            {Number(total).toFixed(2)}
          </div>
        </div>

        {customerName && (
          <div style={{ marginTop: 8 }}>Cliente: {customerName}</div>
        )}
        {notes && <div>Notas: {notes}</div>}
        {reference && <div>Ref: {reference}</div>}

        <div style={{ marginTop: 12, textAlign: 'center' }}>
          Gracias por su compra
        </div>
      </div>
    );
  },
);

export default ReceiptPrint;
