Factory.define :user do |f|
  f.password "password"
  f.sequence(:email) { |n| "user#{n}@listkungfuqa.com" }
  f.sequence(:username) { |n| "User #{n}" }
end

Factory.define :list do |f|
  f.sequence(:title) { |n| "List #{n}" }
  f.association :owner, :factory => :user
end

Factory.define :list_item do |f|
  f.body "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec faucibus elementum tempus. Fusce nibh elit, cursus at porttitor elementum, consectetur vel diam. Curabitur vehicula suscipit tincidunt. Proin ac purus diam, vitae accumsan mauris. Cras diam nunc, adipiscing sed dapibus pellentesque, ornare quis justo. Suspendisse nisi nulla, congue placerat cursus vitae, euismod dapibus tortor. Pellentesque tellus sapien, malesuada a pulvinar id, sagittis in orci. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Cras vehicula urna at mauris iaculis imperdiet. Donec iaculis, urna sed volutpat vestibulum, ipsum dolor sodales arcu, vel vestibulum velit quam et risus."
  f.completed false
  f.deadline nil
  #f.parent nil
  f.association :list
end

Factory.define :tag do |f|
  f.sequence(:name) { |n| "Tag #{n}" }
end

Factory.define :filter do |f|
  f.sequence(:name) { |n| "Filter #{n}" }
  f.searchtext ""
end