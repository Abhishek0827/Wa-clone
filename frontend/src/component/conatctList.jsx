export default function ContactList({selectedPerson, list, onSubChildClick }) {
  return (
    <>
      {list?.map((x) => {
        return (
          <div
            key={x._id}
            className="contactListName"
            onClick={() => onSubChildClick(x)}
           style={x.name === selectedPerson?.name ? { background: '#ffffff40' } : {}}
          >
            <img src="/DP_icon.jpg" alt="" />
            <div>
              <h1>{x.name}</h1>
              <h6>Tap to chat</h6>
            </div>
          </div>
        );
      })}
    </>
  );
}
