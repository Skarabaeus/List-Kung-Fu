class ListItemsController < ApplicationController

  respond_to :xml

  def index
    case params[ :show ]
    when "all"
      @list_items = ListItem.where( "list_id = ?", params[ :list_id ] ).order( "created_at desc" )
    when "completed"
      @list_items = ListItem.where( "list_id = ? AND completed = ?", params[ :list_id ], true ).order( "created_at desc" )
    else # uncompleted
      @list_items = ListItem.where( "list_id = ? AND completed = ?", params[ :list_id ], false ).order( "created_at desc" )
    end
    respond_with( @list_items )
  end

  def show
    @list_item = ListItem.find(params[:id])
    respond_with(@list_item)
  end

  def new
    @list_item = ListItem.new

    @list_item.list_id = params[ :list_id ]

    respond_with( @list_item ) do |format|
      format.js
    end
  end

  def edit
    @list_item = ListItem.find(params[:id])

    respond_with( @list_item ) do |format|
      format.js
    end
  end

  def create
    @list_item = ListItem.new(params[:list_item])

    @list_item.list_id = params[ :list_id ]

    if @list_item.save
      flash[:notice] = 'List Item has been created.'
    end

    respond_with( @list_item )
  end

  def update
    @list_item = ListItem.find(params[:id])
    if @list_item.update_attributes(params[:list_item])
      flash[:notice] = 'List Item has been updated.'
    end

    respond_with( @list_item )
  end

  def destroy
    @list_item = ListItem.find( params[:id] )
    @list_item.destroy

    respond_with( @list_item )
  end
end
