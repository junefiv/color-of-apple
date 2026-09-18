export function PhoneFrame({
  children,
}: {
  label?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="phone-stage">
      <div className="device-frame" data-token="background">
        <div className="device-status" data-token="text">
          <span>9:41</span>
          <span className="tracking-widest">●●●</span>
        </div>
        <div className="phone-screen" style={{ paddingTop: 0 }}>
          {children}
        </div>
        <div className="device-home">
          <span />
        </div>
      </div>
    </div>
  );
}
